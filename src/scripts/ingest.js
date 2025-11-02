/**
 * Document Ingestion Script
 * 
 * Standalone script to run document ingestion from the command line.
 * Usage: npm run ingest
 */

import { ingestDocuments } from '../services/ingestDocuments.js';

console.log('=====================================');
console.log('  Document Ingestion Script');
console.log('=====================================\n');

// Run ingestion
ingestDocuments()
  .then(() => {
    console.log('\n✅ Ingestion script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Ingestion script failed:', error.message);
    process.exit(1);
  });
