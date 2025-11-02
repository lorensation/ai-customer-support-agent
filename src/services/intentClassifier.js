/**
 * Intent Classification Module
 * 
 * Uses OpenAI to classify user queries into document categories
 * for improved retrieval through metadata filtering.
 */

import { openai, OPENAI_CONFIG } from '../config.js';

/**
 * Document categories that map to source files
 */
export const DOCUMENT_CATEGORIES = {
  API_DOCUMENTATION: 'api-documentation.md',
  BILLING: 'billing.md',
  FAQ: 'faq.md',
  PRODUCT_INFO: 'product-info.md',
  QUICK_START: 'quick-start.md',
  SECURITY_PRIVACY: 'security-privacy.md',
  TROUBLESHOOTING: 'troubleshooting.md',
  GENERAL: null // No filtering
};

/**
 * System prompt for intent classification
 */
const CLASSIFICATION_SYSTEM_PROMPT = `You are an intent classifier for a customer support system. Analyze the user's query and determine which documentation category is most relevant.

Available categories:
- api-documentation: Questions about API endpoints, authentication, webhooks, rate limits, SDKs
- billing: Questions about pricing, plans, payments, invoices, subscriptions, refunds, discounts
- faq: General frequently asked questions, account management, features usage
- product-info: Questions about product features, capabilities, platform availability, pricing tiers overview
- quick-start: Questions about getting started, onboarding, initial setup, first steps
- security-privacy: Questions about security, encryption, compliance, privacy, data protection, GDPR
- troubleshooting: Technical issues, errors, problems, bugs, performance issues, connectivity
- general: Queries that don't fit specific categories or span multiple categories

Respond with ONLY the category name (lowercase, with hyphens) and nothing else.`;

/**
 * Classifies user query to determine relevant document category
 * 
 * @param {string} query - The user's question
 * @returns {Promise<string|null>} Category name or null for general queries
 */
export async function classifyIntent(query) {
  try {
    console.log('🎯 Classifying user intent...');
    
    const response = await openai.chat.completions.create({
      model: OPENAI_CONFIG.chatModel,
      messages: [
        { role: 'system', content: CLASSIFICATION_SYSTEM_PROMPT },
        { role: 'user', content: query }
      ],
      temperature: 0.3, // Lower temperature for more consistent classification
      max_tokens: 50,
    });

    const classification = response.choices[0].message.content.trim().toLowerCase();
    console.log(`   - Intent classified as: ${classification}`);

    // Map classification to source filename
    const sourceFile = getSourceFileFromCategory(classification);
    
    if (sourceFile) {
      console.log(`   - Will filter by source: ${sourceFile}`);
    } else {
      console.log('   - No filtering applied (general query)');
    }

    return sourceFile;

  } catch (error) {
    console.error('❌ Error classifying intent:', error.message);
    console.log('   - Falling back to no filtering');
    return null; // Fall back to no filtering on error
  }
}

/**
 * Maps category classification to source filename
 * 
 * @param {string} category - Category from classification
 * @returns {string|null} Source filename or null
 */
function getSourceFileFromCategory(category) {
  const categoryMap = {
    'api-documentation': DOCUMENT_CATEGORIES.API_DOCUMENTATION,
    'billing': DOCUMENT_CATEGORIES.BILLING,
    'faq': DOCUMENT_CATEGORIES.FAQ,
    'product-info': DOCUMENT_CATEGORIES.PRODUCT_INFO,
    'quick-start': DOCUMENT_CATEGORIES.QUICK_START,
    'security-privacy': DOCUMENT_CATEGORIES.SECURITY_PRIVACY,
    'troubleshooting': DOCUMENT_CATEGORIES.TROUBLESHOOTING,
    'general': DOCUMENT_CATEGORIES.GENERAL,
  };

  return categoryMap[category] || null;
}

/**
 * Creates a JSONB filter for Supabase based on source file
 * 
 * @param {string|null} sourceFile - The source file to filter by
 * @returns {object} JSONB filter object
 */
export function createMetadataFilter(sourceFile) {
  if (!sourceFile) {
    return {}; // No filter
  }

  // Supabase JSONB filter format
  return {
    source: sourceFile
  };
}

/**
 * Classifies intent and returns appropriate metadata filter
 * 
 * @param {string} query - The user's question
 * @returns {Promise<object>} Metadata filter object for Supabase
 */
export async function getMetadataFilterFromQuery(query) {
  const sourceFile = await classifyIntent(query);
  return createMetadataFilter(sourceFile);
}
