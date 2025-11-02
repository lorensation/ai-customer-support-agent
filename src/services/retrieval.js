/**
 * Semantic Retrieval Module
 * 
 * Handles vector similarity search using Supabase pgvector.
 * Converts user queries to embeddings and retrieves the most
 * semantically similar documents from the knowledge base.
 * 
 * Includes intent-based filtering to narrow down search results
 * to relevant document categories.
 */

import { openai, supabase, OPENAI_CONFIG, SUPABASE_CONFIG } from '../config.js';
import { getMetadataFilterFromQuery } from './intentClassifier.js';

/**
 * Performs semantic search to find relevant documents
 * 
 * @param {string} query - The user's question or search query
 * @param {number} topK - Number of results to return (default from config)
 * @param {number} threshold - Minimum similarity score (default from config)
 * @param {boolean} useIntentFiltering - Whether to use intent-based filtering (default: true)
 * @returns {Promise<Array>} Array of matching documents with similarity scores
 */
export async function retrieveRelevantDocuments(
  query,
  topK = SUPABASE_CONFIG.topK,
  threshold = SUPABASE_CONFIG.similarityThreshold,
  useIntentFiltering = true
) {
  try {
    console.log(`🔍 Searching for: "${query}"`);
    
    // 1. Classify intent and get metadata filter
    let metadataFilter = {};
    if (useIntentFiltering) {
      metadataFilter = await getMetadataFilterFromQuery(query);
    }
    
    // 2. Generate embedding for the user's query
    console.log('   - Generating query embedding...');
    const embeddingResponse = await openai.embeddings.create({
      model: OPENAI_CONFIG.embeddingModel,
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log('   - Query embedded successfully');

    // 3. Perform similarity search using pgvector
    // Note: This uses the match_customer_support_docs RPC function (defined in Supabase)
    console.log(`   - Querying Supabase for top ${topK} matches...`);
    
    const { data, error } = await supabase.rpc('match_customer_support_docs', {
      query_embedding: queryEmbedding,
      match_count: topK,
      match_threshold: threshold,
      filter: metadataFilter
    });

    if (error) {
      console.error('❌ Error during vector search:', error);
      throw new Error(`Vector search failed: ${error.message}`);
    }

    // 4. Process and return results
    if (!data || data.length === 0) {
      console.log('   ⚠️  No relevant documents found above threshold');
      
      // If no results with filtering, retry without filtering
      if (useIntentFiltering && Object.keys(metadataFilter).length > 0) {
        console.log('   🔄 Retrying search without intent filtering...');
        return retrieveRelevantDocuments(query, topK, threshold, false);
      }
      
      return [];
    }

    console.log(`   ✅ Found ${data.length} relevant document(s)`);
    
    // Log results with similarity scores
    data.forEach((doc, index) => {
      const chunkInfo = doc.metadata?.chunk_index !== undefined 
        ? ` (chunk ${doc.metadata.chunk_index + 1}/${doc.metadata.total_chunks})`
        : '';
      console.log(`      ${index + 1}. [Similarity: ${doc.similarity.toFixed(3)}] ${doc.metadata?.source || 'Unknown'}${chunkInfo}`);
    });

    return data;

  } catch (error) {
    console.error('❌ Error in retrieveRelevantDocuments:', error.message);
    throw error;
  }
}

/**
 * Formats retrieved documents into context string for LLM prompts
 * 
 * @param {Array} documents - Array of document objects from retrieval
 * @returns {string} Formatted context string
 */
export function formatDocumentsAsContext(documents) {
  if (!documents || documents.length === 0) {
    return 'No relevant information found in the knowledge base.';
  }

  const contextParts = documents.map((doc, index) => {
    const source = doc.metadata?.source || 'Unknown';
    const chunkInfo = doc.metadata?.chunk_index !== undefined
      ? ` [Chunk ${doc.metadata.chunk_index + 1}/${doc.metadata.total_chunks}]`
      : '';
    const content = doc.content || '';
    
    return `[Source ${index + 1}: ${source}${chunkInfo}]\n${content}`;
  });

  return contextParts.join('\n\n---\n\n');
}

/**
 * Checks if the knowledge base has any documents
 * Useful for validation before starting the server
 * 
 * @returns {Promise<boolean>} True if documents exist, false otherwise
 */
export async function verifyKnowledgeBaseExists() {
  try {
    const { count, error } = await supabase
      .from(SUPABASE_CONFIG.tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error checking knowledge base:', error);
      return false;
    }

    console.log(`📚 Knowledge base contains ${count} document(s)`);
    return count > 0;

  } catch (error) {
    console.error('❌ Error verifying knowledge base:', error.message);
    return false;
  }
}
