/**
 * Zod Schemas and TypeScript Types
 * 
 * All structured data validation for the AI customer support system.
 * Validates both incoming requests and LLM-generated responses.
 */

import { z } from 'zod';

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

/**
 * User query request schema
 */
export const UserQuerySchema = z.object({
  query: z.string()
    .min(3, 'Query must be at least 3 characters')
    .max(1000, 'Query must not exceed 1000 characters')
    .trim(),
  sessionId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type UserQuery = z.infer<typeof UserQuerySchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

/**
 * Source document reference schema
 */
export const SourceSchema = z.object({
  id: z.union([z.string(), z.number()]),
  filename: z.string(),
  similarity: z.union([z.string(), z.number()]).optional(),
  excerpt: z.string().optional(),
  url: z.string().url().optional(),
});

export type Source = z.infer<typeof SourceSchema>;

/**
 * Core support response schema - structured output from LLM
 */
export const SupportResponseSchema = z.object({
  answer: z.string()
    .min(10, 'Answer must be substantial')
    .describe('The main response to the user query'),
  
  confidence: z.number()
    .min(0)
    .max(1)
    .describe('Confidence score 0-1, where <0.6 triggers web search'),
  
  sources: z.array(SourceSchema)
    .optional()
    .describe('References to knowledge base documents used'),
  
  needsWebSearch: z.boolean()
    .optional()
    .default(false)
    .describe('Flag indicating if web search should be triggered'),
  
  category: z.enum([
    'api-documentation',
    'billing',
    'faq',
    'product-info',
    'quick-start',
    'security-privacy',
    'troubleshooting',
    'general',
  ]).optional()
    .describe('Classified intent category'),
  
  metadata: z.object({
    model: z.string().optional(),
    timestamp: z.string().optional(),
    documentsRetrieved: z.number().optional(),
    toolsUsed: z.array(z.string()).optional(),
  }).optional(),
});

export type SupportResponse = z.infer<typeof SupportResponseSchema>;

/**
 * API response wrapper schema
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: SupportResponseSchema.optional(),
  error: z.string().optional(),
  errorDetails: z.string().optional(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// ============================================================================
// TOOL SCHEMAS
// ============================================================================

/**
 * Retrieval tool input schema
 */
export const RetrievalToolInputSchema = z.object({
  query: z.string().describe('The search query for the knowledge base'),
  topK: z.number().min(1).max(10).default(5).optional(),
  threshold: z.number().min(0).max(1).default(0.3).optional(),
});

export type RetrievalToolInput = z.infer<typeof RetrievalToolInputSchema>;

/**
 * Retrieval tool output schema
 */
export const RetrievalToolOutputSchema = z.object({
  documents: z.array(z.object({
    content: z.string(),
    metadata: z.record(z.any()),
    similarity: z.number(),
  })),
  totalRetrieved: z.number(),
  averageConfidence: z.number(),
});

export type RetrievalToolOutput = z.infer<typeof RetrievalToolOutputSchema>;

/**
 * Web search tool input schema
 */
export const WebSearchToolInputSchema = z.object({
  query: z.string().describe('The search query for web search'),
  maxResults: z.number().min(1).max(10).default(3).optional(),
});

export type WebSearchToolInput = z.infer<typeof WebSearchToolInputSchema>;

/**
 * Web search tool output schema
 */
export const WebSearchToolOutputSchema = z.object({
  results: z.array(z.object({
    title: z.string(),
    url: z.string().url(),
    snippet: z.string(),
    score: z.number().optional(),
  })),
  totalResults: z.number(),
  source: z.enum(['tavily', 'duckduckgo', 'serpapi']),
});

export type WebSearchToolOutput = z.infer<typeof WebSearchToolOutputSchema>;

// ============================================================================
// AGENT SCHEMAS
// ============================================================================

/**
 * Agent decision schema - for tool selection logic
 */
export const AgentDecisionSchema = z.object({
  shouldUseWebSearch: z.boolean()
    .describe('Whether to fall back to web search'),
  
  reasoning: z.string()
    .describe('Explanation for the decision'),
  
  confidenceScore: z.number()
    .min(0)
    .max(1)
    .describe('Overall confidence in retrieval results'),
  
  toolsToUse: z.array(z.enum(['retrieval', 'webSearch']))
    .describe('Ordered list of tools to invoke'),
});

export type AgentDecision = z.infer<typeof AgentDecisionSchema>;

/**
 * Streaming chunk schema for Vercel AI SDK
 */
export const StreamChunkSchema = z.object({
  type: z.enum(['text', 'tool_call', 'tool_result', 'error']),
  content: z.string().optional(),
  toolName: z.string().optional(),
  toolInput: z.any().optional(),
  toolOutput: z.any().optional(),
  timestamp: z.number(),
});

export type StreamChunk = z.infer<typeof StreamChunkSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates and parses data with Zod schema
 * Returns parsed data or throws descriptive error
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('; ');
      throw new Error(
        `Validation failed${context ? ` for ${context}` : ''}: ${formattedErrors}`
      );
    }
    throw error;
  }
}

/**
 * Safe validation that returns result object instead of throwing
 */
export function safeValidateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const formattedErrors = result.error.errors
    .map(err => `${err.path.join('.')}: ${err.message}`)
    .join('; ');
  
  return { success: false, error: formattedErrors };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if response needs web search
 */
export function needsWebSearchFallback(
  response: SupportResponse,
  threshold: number = 0.6
): boolean {
  return (
    response.needsWebSearch === true ||
    response.confidence < threshold ||
    !response.sources ||
    response.sources.length === 0
  );
}

/**
 * Type guard for successful API responses
 */
export function isSuccessResponse(
  response: ApiResponse
): response is ApiResponse & { success: true; data: SupportResponse } {
  return response.success === true && response.data !== undefined;
}

/**
 * Type guard for error API responses
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiResponse & { success: false; error: string } {
  return response.success === false && response.error !== undefined;
}
