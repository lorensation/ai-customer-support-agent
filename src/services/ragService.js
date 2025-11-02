/**
 * RAG Service Module
 * 
 * Orchestrates the complete Retrieval-Augmented Generation pipeline:
 * 1. Retrieves relevant documents based on user query
 * 2. Constructs context-aware prompts
 * 3. Generates customer-facing responses using OpenAI
 * 
 * This is the core AI logic that powers the customer support agent.
 */

import { openai, OPENAI_CONFIG } from '../config.js';
import { 
  retrieveRelevantDocuments, 
  formatDocumentsAsContext 
} from './retrieval.js';

/**
 * System prompt that defines the AI agent's behavior and personality
 * Customize this to match your brand voice and support style
 */
const SYSTEM_PROMPT = `You are a friendly and professional customer support agent. Your goal is to help customers by providing accurate, concise, and helpful answers based on the company's knowledge base.

Guidelines:
- Be warm, empathetic, and professional
- Provide clear, actionable answers
- If the knowledge base doesn't contain relevant information, politely say so and offer to escalate
- Keep responses concise (2-3 paragraphs maximum)
- Use the context provided to give accurate information
- Never make up information that isn't in the provided context
- If you're unsure, acknowledge it and suggest next steps

Your tone should be helpful, confident, and customer-centric.`;

/**
 * Main RAG function - handles the complete query-to-response pipeline
 * 
 * @param {string} userQuery - The customer's question
 * @returns {Promise<Object>} Response object with answer, sources, and metadata
 */
export async function generateSupportResponse(userQuery) {
  console.log(`\n💬 Processing query: "${userQuery}"`);
  
  try {
    // 1. Retrieve relevant documents from knowledge base
    const relevantDocs = await retrieveRelevantDocuments(userQuery);
    
    // 2. Format context for the LLM
    const context = formatDocumentsAsContext(relevantDocs);
    
    // 3. Construct the prompt with context and query
    const userPrompt = buildUserPrompt(userQuery, context);
    
    // 4. Generate response using OpenAI
    console.log('🤖 Generating AI response...');
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.chatModel,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: OPENAI_CONFIG.temperature,
      max_tokens: OPENAI_CONFIG.maxTokens,
    });

    const answer = completion.choices[0].message.content;
    console.log('✅ Response generated successfully\n');

    // 5. Prepare response with metadata
    return {
      success: true,
      answer: answer,
      sources: extractSources(relevantDocs),
      metadata: {
        documentsRetrieved: relevantDocs.length,
        model: OPENAI_CONFIG.chatModel,
        timestamp: new Date().toISOString(),
      }
    };

  } catch (error) {
    console.error('❌ Error generating support response:', error.message);
    
    return {
      success: false,
      error: 'Failed to generate response',
      errorDetails: error.message,
      answer: 'I apologize, but I encountered an error while processing your question. Please try again or contact our support team directly.',
      sources: [],
      metadata: {
        timestamp: new Date().toISOString(),
      }
    };
  }
}

/**
 * Builds the user prompt with context and query
 * 
 * @param {string} query - User's question
 * @param {string} context - Formatted context from retrieved documents
 * @returns {string} Complete prompt for the LLM
 */
function buildUserPrompt(query, context) {
  return `Based on the following information from our knowledge base, please answer the customer's question.

KNOWLEDGE BASE CONTEXT:
${context}

CUSTOMER QUESTION:
${query}

Please provide a helpful, accurate response based on the context above. If the context doesn't contain enough information to fully answer the question, acknowledge that and explain what you can help with.`;
}

/**
 * Extracts source information from retrieved documents
 * 
 * @param {Array} documents - Retrieved document objects
 * @returns {Array} Array of source objects with metadata
 */
function extractSources(documents) {
  return documents.map((doc, index) => ({
    id: index + 1,
    filename: doc.metadata?.source || 'Unknown',
    similarity: doc.similarity ? doc.similarity.toFixed(3) : 'N/A',
    excerpt: doc.content ? doc.content.substring(0, 100) + '...' : ''
  }));
}

/**
 * Validates user query before processing
 * 
 * @param {string} query - User's input
 * @returns {Object} Validation result with isValid flag and message
 */
export function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    return {
      isValid: false,
      message: 'Query must be a non-empty string'
    };
  }

  const trimmedQuery = query.trim();
  
  if (trimmedQuery.length === 0) {
    return {
      isValid: false,
      message: 'Query cannot be empty'
    };
  }

  if (trimmedQuery.length < 3) {
    return {
      isValid: false,
      message: 'Query must be at least 3 characters long'
    };
  }

  if (trimmedQuery.length > 1000) {
    return {
      isValid: false,
      message: 'Query is too long (maximum 1000 characters)'
    };
  }

  return {
    isValid: true,
    message: 'Valid query'
  };
}
