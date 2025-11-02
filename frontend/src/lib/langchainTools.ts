/**
 * LangChain Tools Integration
 * 
 * Defines custom tools for the LangChain agent:
 * 1. retrievalTool - Queries Supabase vector store via backend
 * 2. webSearchTool - Performs web search using Tavily API
 * 
 * These tools are orchestrated by the agent to provide comprehensive answers.
 */

import { DynamicStructuredTool } from '@langchain/core/tools';
import {
  RetrievalToolInputSchema,
  RetrievalToolOutputSchema,
  WebSearchToolInputSchema,
  WebSearchToolOutputSchema,
  type RetrievalToolOutput,
  type WebSearchToolOutput,
} from './zodSchemas';

// ============================================================================
// RETRIEVAL TOOL - Queries Backend Vector Store
// ============================================================================

/**
 * Creates a retrieval tool that queries the Supabase vector store
 * via the existing Node.js backend
 */
export function createRetrievalTool(backendUrl: string) {
  return new DynamicStructuredTool({
    name: 'retrieval_tool',
    description: `Retrieves relevant documents from the company knowledge base using semantic search.
    Use this tool FIRST to find information from official documentation about:
    - API documentation and technical details
    - Billing, pricing, and payment information
    - Product features and capabilities
    - Security and privacy policies
    - Troubleshooting guides
    - FAQs and common questions
    
    This should be your primary source of truth.`,
    
    schema: RetrievalToolInputSchema,
    
    func: async ({ query, topK = 5, threshold = 0.3 }) => {
      try {
        console.log(`🔍 [Retrieval Tool] Searching knowledge base for: "${query}"`);
        
        // Call the existing backend /api/ask endpoint
        const response = await fetch(`${backendUrl}/api/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success) {
          console.warn('⚠️ [Retrieval Tool] Backend returned error:', data.error);
          return JSON.stringify({
            documents: [],
            totalRetrieved: 0,
            averageConfidence: 0,
            error: data.error || 'Retrieval failed',
          });
        }

        // Extract document information from backend response
        const documents = data.sources?.map((source: any) => ({
          content: source.excerpt || '',
          metadata: {
            source: source.filename,
            id: source.id,
          },
          similarity: parseFloat(source.similarity) || 0,
        })) || [];

        const averageConfidence = documents.length > 0
          ? documents.reduce((sum: number, doc: any) => sum + doc.similarity, 0) / documents.length
          : 0;

        const result: RetrievalToolOutput = {
          documents,
          totalRetrieved: documents.length,
          averageConfidence,
        };

        console.log(`✅ [Retrieval Tool] Retrieved ${documents.length} documents (avg confidence: ${averageConfidence.toFixed(3)})`);

        // Return formatted string for LangChain agent
        if (documents.length === 0) {
          return 'No relevant documents found in the knowledge base. Consider using web search for this query.';
        }

        const formattedDocs = documents
          .map((doc: any, idx: number) => 
            `[Document ${idx + 1} - ${doc.metadata.source} (similarity: ${doc.similarity.toFixed(3)})]\n${doc.content}`
          )
          .join('\n\n---\n\n');

        return `Retrieved ${documents.length} relevant documents:\n\n${formattedDocs}`;

      } catch (error) {
        console.error('❌ [Retrieval Tool] Error:', error);
        return `Error accessing knowledge base: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  });
}

// ============================================================================
// WEB SEARCH TOOL - Tavily API Integration
// ============================================================================

/**
 * Creates a web search tool using Tavily API
 * Falls back when retrieval confidence is low or no results found
 */
export function createWebSearchTool(tavilyApiKey: string) {
  return new DynamicStructuredTool({
    name: 'web_search_tool',
    description: `Performs web search to find current, external information not in the knowledge base.
    Use this tool when:
    - Retrieval tool returns no results or low confidence (<0.6)
    - Query is about current events, news, or recent updates
    - Query requires information beyond the company's documentation
    - User explicitly asks about external/general information
    
    This is a FALLBACK tool - try retrieval_tool first.`,
    
    schema: WebSearchToolInputSchema,
    
    func: async ({ query, maxResults = 3 }) => {
      try {
        console.log(`🌐 [Web Search Tool] Searching web for: "${query}"`);

        if (!tavilyApiKey || tavilyApiKey === 'tvly-your-tavily-api-key') {
          console.warn('⚠️ [Web Search Tool] No valid Tavily API key configured');
          return 'Web search is not configured. Please add TAVILY_API_KEY to your environment variables. Get a free key at https://tavily.com';
        }

        // Call Tavily Search API
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            api_key: tavilyApiKey,
            query,
            max_results: maxResults,
            search_depth: 'basic',
            include_answer: true,
            include_raw_content: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Tavily API returned ${response.status}`);
        }

        const data = await response.json();

        const results = data.results?.map((result: any) => ({
          title: result.title,
          url: result.url,
          snippet: result.content,
          score: result.score,
        })) || [];

        const webSearchOutput: WebSearchToolOutput = {
          results,
          totalResults: results.length,
          source: 'tavily',
        };

        console.log(`✅ [Web Search Tool] Found ${results.length} web results`);

        // Format results for LangChain agent
        if (results.length === 0) {
          return 'No web results found for this query.';
        }

        let formatted = `Found ${results.length} relevant web results:\n\n`;
        
        // Include Tavily's direct answer if available
        if (data.answer) {
          formatted += `Quick Answer: ${data.answer}\n\n---\n\n`;
        }

        formatted += results
          .map((result: any, idx: number) =>
            `[Result ${idx + 1}]\nTitle: ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}`
          )
          .join('\n\n---\n\n');

        return formatted;

      } catch (error) {
        console.error('❌ [Web Search Tool] Error:', error);
        return `Error performing web search: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    },
  });
}

// ============================================================================
// TOOL ORCHESTRATION HELPERS
// ============================================================================

/**
 * Determines which tools to use based on query analysis
 * Returns ordered list of tool names
 */
export function determineToolStrategy(
  query: string,
  retrievalConfidence?: number
): string[] {
  // Keywords that suggest web search might be needed
  const webSearchKeywords = [
    'latest', 'recent', 'current', 'news', 'today',
    'update', 'new', 'compare with', 'vs', 'versus',
    'industry', 'market', 'competitor'
  ];

  const lowerQuery = query.toLowerCase();
  const hasWebSearchKeyword = webSearchKeywords.some(keyword => 
    lowerQuery.includes(keyword)
  );

  // Strategy 1: Start with web search if query suggests it
  if (hasWebSearchKeyword) {
    return ['retrieval_tool', 'web_search_tool'];
  }

  // Strategy 2: Retrieval only by default
  return ['retrieval_tool'];
}

/**
 * Evaluates if web search fallback should be triggered
 */
export function shouldTriggerWebSearch(
  retrievalResult: string,
  confidence?: number,
  threshold: number = 0.6
): boolean {
  // Check for low confidence
  if (confidence !== undefined && confidence < threshold) {
    console.log(`⚠️ Low retrieval confidence (${confidence.toFixed(3)} < ${threshold}), triggering web search`);
    return true;
  }

  // Check for no results indicators in retrieval response
  const noResultsIndicators = [
    'no relevant documents found',
    'no results',
    'could not find',
    'retrieved 0 documents',
  ];

  const hasNoResults = noResultsIndicators.some(indicator =>
    retrievalResult.toLowerCase().includes(indicator)
  );

  if (hasNoResults) {
    console.log('⚠️ No retrieval results found, triggering web search');
    return true;
  }

  return false;
}

/**
 * Combines results from multiple tools into coherent context
 */
export function combineToolResults(
  retrievalResult: string,
  webSearchResult?: string
): string {
  if (!webSearchResult) {
    return retrievalResult;
  }

  return `
KNOWLEDGE BASE INFORMATION:
${retrievalResult}

ADDITIONAL WEB SEARCH RESULTS:
${webSearchResult}

Please synthesize information from both sources, prioritizing the knowledge base for official company information.
`;
}
