-- =====================================================
-- Supabase Database Schema Setup
-- AI Customer Support Agent - Vector Store
-- =====================================================
--
-- This SQL script creates the necessary tables and functions
-- for the RAG-based customer support agent.
--
-- INSTRUCTIONS:
-- 1. Open your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "Run" to execute
-- =====================================================

-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- Table: customer-support-docs
-- Stores document content, embeddings, and metadata
-- =====================================================

CREATE TABLE IF NOT EXISTS "customer-support-docs" (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on embedding column for faster similarity searches
CREATE INDEX IF NOT EXISTS customer_support_docs_embedding_idx 
ON "customer-support-docs" 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on metadata for filtering (optional but recommended)
CREATE INDEX IF NOT EXISTS customer_support_docs_metadata_idx 
ON "customer-support-docs" 
USING GIN (metadata);

-- =====================================================
-- Function: match_customer_support_docs
-- Performs similarity search using cosine distance
-- with optional metadata filtering
-- =====================================================

CREATE OR REPLACE FUNCTION match_customer_support_docs (
  query_embedding vector(1536), -- Matches the embedding dimensions
  match_count int DEFAULT 5,    -- How many results to return (defaults to 5)
  match_threshold float DEFAULT 0.3, -- Ensures that only documents that have a minimum similarity to the query_embedding are returned
  filter jsonb DEFAULT '{}'     -- Metadata filter (e.g., {"source": "billing.md"})
) RETURNS TABLE (
  id bigint,
  content text,
  metadata jsonb, -- Return the metadata along with the content
  similarity float
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    "customer-support-docs".id,
    "customer-support-docs".content,
    "customer-support-docs".metadata,
    -- Calculate cosine similarity (1 - cosine distance)
    -- <=> is the cosine distance operator
    1 - ("customer-support-docs".embedding <=> query_embedding) AS similarity
  FROM "customer-support-docs"
  -- Apply metadata filter if provided (using JSONB containment operator @>)
  WHERE 
    1 - ("customer-support-docs".embedding <=> query_embedding) > match_threshold
    AND (
      filter = '{}'::jsonb  -- No filter
      OR "customer-support-docs".metadata @> filter  -- Filter matches
    )
  ORDER BY "customer-support-docs".embedding <=> query_embedding -- Order by cosine distance (closest first)
  LIMIT match_count; -- Limit the number of results
END;
$$;

-- =====================================================
-- Function: update_updated_at_column
-- Automatically updates the updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS update_customer_support_docs_updated_at ON "customer-support-docs";
CREATE TRIGGER update_customer_support_docs_updated_at
  BEFORE UPDATE ON "customer-support-docs"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS) - Optional
-- Uncomment if you need RLS for your use case
-- =====================================================

-- Enable RLS on customer-support-docs table
ALTER TABLE "customer-support-docs" ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role to do everything
CREATE POLICY "Service role can do everything"
  ON "customer-support-docs"
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Verification Queries
-- Run these after setup to verify everything works
-- =====================================================

-- Check if extension is enabled
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if table exists
-- SELECT * FROM information_schema.tables WHERE table_name = 'customer-support-docs';

-- Check if function exists
-- SELECT * FROM pg_proc WHERE proname = 'match_customer_support_docs';

-- Count documents in table
-- SELECT COUNT(*) FROM "customer-support-docs";

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Configure your .env file with SUPABASE_URL and SUPABASE_SERVICE_KEY
-- 2. Add documents to the /docs folder
-- 3. Run: npm run ingest
-- 4. Start the server: npm start
-- =====================================================
