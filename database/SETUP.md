# Supabase Database Setup Guide

## Prerequisites
- A Supabase account (free tier works fine)
- Your Supabase project created

## Step-by-Step Setup

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project name**: ai-customer-support
   - **Database password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for provisioning (~2 minutes)

### 2. Run the Database Schema
1. In your Supabase dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. You should see: ✅ Success. No rows returned

### 3. Verify the Setup
Run these verification queries in the SQL Editor:

```sql
-- Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if customer-support-docs table exists
SELECT * FROM information_schema.tables WHERE table_name = 'customer-support-docs';

-- Check if match_customer_support_docs function exists
SELECT proname, pronargs FROM pg_proc WHERE proname = 'match_customer_support_docs';
```

### 4. Get Your API Keys
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values to your `.env` file:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (under "Project API keys") → `SUPABASE_SERVICE_KEY`

⚠️ **Important**: Use the `service_role` key, NOT the `anon` key. The service role key bypasses Row Level Security and is required for vector operations.

### 5. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Fill in your credentials:
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-role-key-here
```

## Troubleshooting

### Error: "extension vector does not exist"
- pgvector extension is not installed
- Solution: Run `CREATE EXTENSION IF NOT EXISTS vector;` in SQL Editor

### Error: "function match_documents does not exist"
- The RPC function wasn't created properly
- Solution: Re-run the schema.sql script

### Error: "permission denied for table documents"
- Using wrong API key (probably anon key instead of service_role)
- Solution: Use the service_role key from Settings → API

### Empty Results from match_documents
- No documents in database yet
- Run: `npm run ingest` to populate the knowledge base

## Database Structure

### Table: `customer-support-docs`
| Column     | Type      | Description                          |
|------------|-----------|--------------------------------------|
| id         | BIGSERIAL | Primary key                          |
| content    | TEXT      | Full document text                   |
| embedding  | VECTOR    | 1536-dimensional embedding vector    |
| metadata   | JSONB     | Source filename, ingestion date, etc |
| created_at | TIMESTAMP | Record creation timestamp            |
| updated_at | TIMESTAMP | Last update timestamp                |

### Function: `match_customer_support_docs`
Performs cosine similarity search on embeddings.

**Parameters:**
- `query_embedding` (VECTOR): The query's embedding vector
- `match_threshold` (FLOAT): Minimum similarity score (default: 0.7)
- `match_count` (INT): Number of results to return (default: 3)

**Returns:**
- `id`: Document ID
- `content`: Document text
- `metadata`: JSON metadata
- `similarity`: Similarity score (0-1, higher is better)

## Security Notes

### Production Considerations
1. **Never commit** the service_role key to version control
2. Enable Row Level Security (RLS) if needed
3. Use environment-specific API keys
4. Monitor usage in Supabase dashboard

### Row Level Security (Optional)
If you need to restrict access by user:
```sql
ALTER TABLE "customer-support-docs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all documents"
  ON "customer-support-docs" FOR SELECT
  TO authenticated
  USING (true);
```

## Next Steps
✅ Database setup complete!

Now proceed to:
1. Add documents to `/docs` folder
2. Run `npm run ingest` to populate the knowledge base
3. Start the server with `npm start`
