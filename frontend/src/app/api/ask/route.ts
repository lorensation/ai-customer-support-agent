/**
 * Next.js API Route: /api/ask
 * 
 * Handles chat requests with LangChain tool orchestration and streaming via Vercel AI SDK.
 * Orchestrates retrieval and web search tools based on confidence and query analysis.
 */

import { StreamingTextResponse, LangChainStream } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { NextRequest, NextResponse } from 'next/server';
import {
  createRetrievalTool,
  createWebSearchTool,
  shouldTriggerWebSearch,
  combineToolResults,
} from '@/lib/langchainTools';
import {
  UserQuerySchema,
  SupportResponseSchema,
  validateSchema,
} from '@/lib/zodSchemas';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY!;
const CONFIDENCE_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.6');

// Validate environment variables
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured');
}

// ============================================================================
// AGENT SYSTEM PROMPT
// ============================================================================

const AGENT_SYSTEM_PROMPT = `You are an expert AI customer support agent with access to multiple tools.

Your goal is to provide accurate, helpful, and professional customer support by:
1. ALWAYS start by using the retrieval_tool to search the knowledge base
2. If retrieval returns low confidence or no results, use web_search_tool as fallback
3. Synthesize information from all sources into a clear, concise answer
4. Be friendly, professional, and empathetic
5. Cite your sources when appropriate
6. If you cannot find information, acknowledge it and suggest next steps

TOOL USAGE STRATEGY:
- retrieval_tool: Your PRIMARY source for official company information
- web_search_tool: Use ONLY when retrieval fails or for current/external information

RESPONSE GUIDELINES:
- Keep answers concise (2-3 paragraphs)
- Structure with clear sections if needed
- Use bullet points for lists
- Maintain warm, professional tone
- Never make up information
- Cite sources: "According to [source]..."

Remember: You're representing the company, so accuracy and professionalism are critical.`;

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    
    // Extract query from Vercel AI SDK format (messages array) or direct query
    let query: string;
    if (body.messages && Array.isArray(body.messages)) {
      // Vercel AI SDK sends messages array - get the last user message
      const lastMessage = body.messages[body.messages.length - 1];
      query = lastMessage?.content || '';
    } else if (body.query) {
      // Direct query format
      query = body.query;
    } else {
      throw new Error('No query or messages found in request');
    }
    
    // Validate the extracted query
    const validatedQuery = validateSchema(UserQuerySchema, { query }, 'request body');
    
    console.log(`\n📥 [API] New query received: "${validatedQuery.query}"`);

    // Initialize LangChain streaming
    const { stream, handlers } = LangChainStream({
      onStart: () => console.log('🚀 [API] Streaming started'),
      onCompletion: (completion) => console.log(`✅ [API] Streaming completed (${completion.length} chars)`),
      onFinal: (final) => console.log('🏁 [API] Stream finalized'),
    });

    // Initialize OpenAI model
    const model = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      streaming: true,
      openAIApiKey: OPENAI_API_KEY,
    });

    // Initialize tools
    const retrievalTool = createRetrievalTool(BACKEND_URL);
    const webSearchTool = createWebSearchTool(TAVILY_API_KEY);
    const tools = [retrievalTool, webSearchTool];

    console.log('🔧 [API] Tools initialized:', tools.map(t => t.name).join(', '));

    // Create agent prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', AGENT_SYSTEM_PROMPT],
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    // Create agent
    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt,
    });

    // Create agent executor with enhanced configuration
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
      maxIterations: 5,
      returnIntermediateSteps: true,
      handleParsingErrors: true,
    });

    // Execute agent asynchronously with callbacks
    executeAgent(agentExecutor, validatedQuery.query, handlers);

    // Return streaming response immediately
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('❌ [API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// AGENT EXECUTION
// ============================================================================

/**
 * Executes the agent with tool orchestration logic
 * Handles retrieval → web search fallback pattern
 */
async function executeAgent(
  agentExecutor: AgentExecutor,
  query: string,
  handlers: any
) {
  try {
    console.log('🤖 [Agent] Starting execution...');

    // Execute agent with the user query and pass callbacks for streaming
    const result = await agentExecutor.call(
      {
        input: query,
      },
      [handlers]
    );

    console.log('✅ [Agent] Execution completed');
    
    // Log intermediate steps for debugging
    if (result.intermediateSteps && result.intermediateSteps.length > 0) {
      console.log('📊 [Agent] Tools used:');
      result.intermediateSteps.forEach((step: any, idx: number) => {
        console.log(`   ${idx + 1}. ${step.action?.tool || 'unknown'}`);
      });
    }

  } catch (error) {
    console.error('❌ [Agent] Execution error:', error);
    handlers.handleLLMError?.(error);
    throw error;
  }
}

// ============================================================================
// ALTERNATIVE: NON-STREAMING WITH STRUCTURED OUTPUT
// ============================================================================

/**
 * Alternative endpoint for non-streaming responses with structured validation
 * Use this if you need structured JSON responses instead of streaming
 */
export async function POST_STRUCTURED(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedQuery = validateSchema(UserQuerySchema, body, 'request body');
    
    console.log(`\n📥 [API-Structured] Query: "${validatedQuery.query}"`);

    // Initialize model without streaming
    const model = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      openAIApiKey: OPENAI_API_KEY,
    });

    const retrievalTool = createRetrievalTool(BACKEND_URL);
    const webSearchTool = createWebSearchTool(TAVILY_API_KEY);
    const tools = [retrievalTool, webSearchTool];

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', AGENT_SYSTEM_PROMPT],
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt,
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
      maxIterations: 5,
      returnIntermediateSteps: true,
    });

    // Execute and wait for completion
    const result = await agentExecutor.invoke({
      input: validatedQuery.query,
    });

    // Calculate confidence based on sources used
    const toolsUsed = result.intermediateSteps?.map((step: any) => step.action?.tool) || [];
    const usedRetrieval = toolsUsed.includes('retrieval_tool');
    const usedWebSearch = toolsUsed.includes('web_search_tool');
    
    // Confidence calculation logic
    let confidence = 0.5;
    if (usedRetrieval && !usedWebSearch) confidence = 0.8;
    if (usedRetrieval && usedWebSearch) confidence = 0.7;
    if (!usedRetrieval && usedWebSearch) confidence = 0.6;

    // Structure the response
    const structuredResponse = {
      answer: result.output,
      confidence,
      sources: extractSourcesFromSteps(result.intermediateSteps),
      needsWebSearch: usedWebSearch,
      metadata: {
        model: 'gpt-4-turbo-preview',
        timestamp: new Date().toISOString(),
        toolsUsed,
      },
    };

    // Validate with Zod
    const validatedResponse = validateSchema(
      SupportResponseSchema,
      structuredResponse,
      'agent response'
    );

    return NextResponse.json({
      success: true,
      data: validatedResponse,
    });

  } catch (error) {
    console.error('❌ [API-Structured] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extracts source information from agent intermediate steps
 */
function extractSourcesFromSteps(intermediateSteps: any[]): any[] {
  if (!intermediateSteps) return [];

  const sources: any[] = [];
  
  intermediateSteps.forEach((step, idx) => {
    const toolName = step.action?.tool;
    const observation = step.observation;

    if (toolName === 'retrieval_tool' && observation) {
      sources.push({
        id: idx + 1,
        filename: 'Knowledge Base',
        excerpt: observation.substring(0, 150) + '...',
      });
    }

    if (toolName === 'web_search_tool' && observation) {
      sources.push({
        id: idx + 1,
        filename: 'Web Search',
        url: 'https://tavily.com',
        excerpt: observation.substring(0, 150) + '...',
      });
    }
  });

  return sources;
}

// ============================================================================
// EDGE RUNTIME (Optional - for faster cold starts)
// ============================================================================

// Uncomment to use Edge Runtime (faster, but with some limitations)
// export const runtime = 'edge';
