/**
 * Document Ingestion Module
 * 
 * Handles the ETL pipeline for knowledge base documents:
 * 1. Reads documents from the /docs directory
 * 2. Splits large documents into chunks using LangChain's RecursiveCharacterTextSplitter
 * 3. Generates embeddings using OpenAI
 * 4. Stores documents and embeddings in Supabase with pgvector
 * 
 * This module processes multiple files and maintains metadata
 * including source filename for traceability.
 */

import { openai, supabase, OPENAI_CONFIG, SUPABASE_CONFIG } from '../config.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Configuration ---
const SOURCE_DOCUMENTS_DIR = 'docs';
const CLEAR_TABLE_ON_INGEST = true; // Set to false to append documents

// Text splitting configuration
const CHUNK_SIZE = 1000; // Maximum characters per chunk
const CHUNK_OVERLAP = 200; // Overlap between chunks for context preservation

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize text splitter
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: CHUNK_SIZE,
  chunkOverlap: CHUNK_OVERLAP,
  separators: ['\n\n', '\n', '. ', ' ', ''], // Prioritize natural breakpoints
});

/**
 * Main ingestion function
 * Processes all documents in the /docs directory and stores them in Supabase
 * 
 * @returns {Promise<void>}
 * @throws {Error} If directory doesn't exist or ingestion fails
 */
export async function ingestDocuments() {
  const docsDirPath = path.join(__dirname, '..', '..', SOURCE_DOCUMENTS_DIR);
  console.log('🚀 Starting document ingestion...');
  console.log(`📁 Source directory: ${docsDirPath}`);

  // Collection to store all processed documents
  const allDocumentsToInsert = [];

  try {
    // 1. Validate source directory
    if (!fs.existsSync(docsDirPath) || !fs.lstatSync(docsDirPath).isDirectory()) {
      throw new Error(
        `Source documents directory not found at ${docsDirPath}. ` +
        `Please create it and add your knowledge base files.`
      );
    }

    // 2. Read all files from directory
    const files = fs.readdirSync(docsDirPath);
    const textFiles = files.filter(f => 
      f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.json')
    );

    if (textFiles.length === 0) {
      console.log('⚠️  No supported files found in /docs directory.');
      console.log('   Supported formats: .txt, .md, .json');
      return;
    }

    console.log(`📄 Found ${textFiles.length} file(s) to process.\n`);

    // 3. Clear existing documents if configured
    if (CLEAR_TABLE_ON_INGEST) {
      console.log(`🗑️  Clearing existing documents from table '${SUPABASE_CONFIG.tableName}'...`);
      
      const { error: deleteError } = await supabase
        .from(SUPABASE_CONFIG.tableName)
        .delete()
        .neq('id', -1); // Deletes all rows (id will never be -1)
      
      if (deleteError) {
        console.warn(`⚠️  Warning: Could not clear existing documents: ${deleteError.message}`);
      } else {
        console.log('✅ Existing documents cleared.\n');
      }
    }

    // 4. Process each file
    for (const filename of textFiles) {
      const filePath = path.join(docsDirPath, filename);
      console.log(`📝 Processing: ${filename}`);

      try {
        // Read file content
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        console.log(`   - Read ${fileContent.length} characters`);

        // Split document into chunks using LangChain
        console.log('   - Splitting document into chunks...');
        const chunks = await textSplitter.splitText(fileContent);
        console.log(`   - Created ${chunks.length} chunk(s)`);

        // Process each chunk
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          console.log(`   - Processing chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`);

          try {
            // Generate embedding for chunk
            const embeddingResponse = await openai.embeddings.create({
              model: OPENAI_CONFIG.embeddingModel,
              input: chunk,
            });

            // Prepare document record for insertion
            const documentRecord = {
              content: chunk,
              embedding: embeddingResponse.data[0].embedding,
              metadata: { 
                source: filename,
                chunk_index: i,
                total_chunks: chunks.length,
                ingested_at: new Date().toISOString(),
                character_count: chunk.length
              },
            };

            allDocumentsToInsert.push(documentRecord);

          } catch (chunkError) {
            console.error(`   ❌ Failed to embed chunk ${i + 1}: ${chunkError.message}`);
          }
        }

        console.log(`   ✅ Successfully processed ${chunks.length} chunk(s)\n`);

      } catch (fileError) {
        console.error(`   ❌ Failed to process ${filename}: ${fileError.message}`);
        console.error(`   Skipping this file...\n`);
      }
    }

    // 5. Validate we have documents to insert
    if (allDocumentsToInsert.length === 0) {
      console.log('❌ No documents were successfully processed. Aborting upload.');
      return;
    }

    console.log(`\n📊 Summary: ${allDocumentsToInsert.length} document(s) ready for upload`);

    // 6. Batch insert into Supabase
    console.log(`\n💾 Uploading to Supabase table '${SUPABASE_CONFIG.tableName}'...`);
    
    const { data, error: insertError } = await supabase
      .from(SUPABASE_CONFIG.tableName)
      .insert(allDocumentsToInsert)
      .select();

    if (insertError) {
      console.error('❌ Error inserting documents into Supabase:', insertError);
      throw new Error(`Supabase insert failed: ${insertError.message}`);
    }

    console.log(`✅ Successfully inserted ${data.length} document(s) into Supabase.`);
    console.log('\n🎉 --- Ingestion Complete! ---');

  } catch (error) {
    console.error('\n❌ --- Ingestion Failed! ---');
    console.error('Error during ingestion process:', error.message);
    throw error;
  }
}
