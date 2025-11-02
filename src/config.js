/**
 * Core Configuration Module
 * 
 * Initializes and exports configured clients for:
 * - OpenAI API (embeddings and chat completions)
 * - Supabase (database and vector store)
 * 
 * All API keys and configuration are loaded from environment variables.
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// --- Environment Variable Validation ---
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file. See .env.example for reference.');
  process.exit(1);
}

// --- OpenAI Configuration ---
/**
 * OpenAI client instance configured with API key
 * Used for embeddings generation and chat completions
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Configuration constants for OpenAI models
 */
export const OPENAI_CONFIG = {
  chatModel: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
  temperature: 0.7, // Balanced creativity vs consistency
  maxTokens: 500,   // Concise customer support responses
};

// --- Supabase Configuration ---
/**
 * Supabase client instance configured with service role key
 * Provides full database access including pgvector operations
 */
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Database configuration constants
 */
export const SUPABASE_CONFIG = {
  tableName: 'customer-support-docs',
  similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD) || 0.3,
  topK: parseInt(process.env.TOP_K_RESULTS) || 5,
};

// --- Server Configuration ---
export const SERVER_CONFIG = {
  port: parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

// Log successful initialization
console.log('✅ Configuration loaded successfully');
console.log(`   - OpenAI Chat Model: ${OPENAI_CONFIG.chatModel}`);
console.log(`   - OpenAI Embedding Model: ${OPENAI_CONFIG.embeddingModel}`);
console.log(`   - Supabase Table: ${SUPABASE_CONFIG.tableName}`);
console.log(`   - Server Port: ${SERVER_CONFIG.port}`);
