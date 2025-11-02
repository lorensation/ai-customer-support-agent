# AI Customer Support Agent 🤖

A production-ready AI customer support agent powered by **Retrieval-Augmented Generation (RAG)** using Node.js, OpenAI, and Supabase pgvector.

## 🌟 Features

- **Semantic Search**: Vector similarity search using Supabase pgvector
- **Intent Classification**: AI-powered query categorization for improved retrieval accuracy
- **Metadata Filtering**: Smart document filtering based on query intent and categories
- **RAG Pipeline**: Context-aware responses based on your knowledge base
- **REST API**: Simple `/api/ask` endpoint for easy integration
- **Modular Architecture**: Clean separation of concerns for maintainability
- **Production Ready**: Error handling, logging, and validation
- **OpenAI Integration**: GPT-4 for responses, text-embedding-3-small for vectors
- **Fallback Mechanism**: Automatic retry without filtering if no results found
- **Easy Deployment**: Ready for Vercel, Railway, or any Node.js host

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture

```
User Query → API Endpoint → RAG Service
                              ↓
                    1. Classify Intent (Category Detection)
                              ↓
                    2. Generate Query Embedding
                              ↓
                    3. Search Vector Database (Supabase)
                       with Metadata Filtering
                              ↓
                    4. Retrieve Top K Documents
                       (Fallback if no results)
                              ↓
                    5. Build Context + Prompt
                              ↓
                    6. Generate Response (OpenAI GPT-4)
                              ↓
                    7. Return Answer + Sources
```

### Core Components

- **`config.js`**: Centralized configuration and client initialization
- **`ingestDocuments.js`**: ETL pipeline for knowledge base documents
- **`intentClassifier.js`**: AI-powered query classification and category mapping
- **`retrieval.js`**: Vector similarity search with metadata filtering
- **`ragService.js`**: RAG orchestration and LLM integration
- **`server.js`**: Express API server with endpoints

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **Supabase Account** (free tier works)
- **OpenAI API Key** (pay-as-you-go)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-customer-support-agent.git
cd ai-customer-support-agent
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
EMBEDDING_MODEL=text-embedding-3-small

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

PORT=3000
NODE_ENV=development

TOP_K_RESULTS=3
SIMILARITY_THRESHOLD=0.7
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `OPENAI_MODEL` | GPT model for responses | `gpt-4-turbo-preview` |
| `EMBEDDING_MODEL` | Model for embeddings | `text-embedding-3-small` |
| `SUPABASE_URL` | Your Supabase project URL | Required |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | Required |
| `PORT` | Server port | `3000` |
| `TOP_K_RESULTS` | Number of documents to retrieve | `3` |
| `SIMILARITY_THRESHOLD` | Minimum similarity score (0-1) | `0.7` |

## 🗄️ Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for provisioning (~2 minutes)

### 2. Run Database Schema
1. Open **SQL Editor** in Supabase dashboard
2. Copy contents of `database/schema.sql`
3. Paste and execute

This creates:
- `customer-support-docs` table with pgvector support
- `match_customer_support_docs()` function for similarity search with metadata filtering
- GIN index on metadata JSONB field for efficient filtering
- IVFFlat index on embeddings for fast vector search
- Automatic timestamp triggers and Row Level Security (RLS)

📖 See [database/SETUP.md](database/SETUP.md) for detailed instructions.

### 3. Get API Keys
In Supabase dashboard: **Settings** → **API**
- Copy **Project URL** → `SUPABASE_URL`
- Copy **service_role key** → `SUPABASE_SERVICE_KEY`

⚠️ **Important**: Use the `service_role` key, not the `anon` key!

## 📚 Usage

### 1. Add Knowledge Base Documents

Add your documentation files to the `/docs` folder. For optimal intent classification, use these recommended filenames:

```
docs/
├── api-documentation.md    # API docs, endpoints, authentication
├── billing.md              # Pricing, payments, subscriptions
├── faq.md                  # General questions, account info
├── product-info.md         # Product features, capabilities
├── quick-start.md          # Getting started guides
├── security-privacy.md     # Security, compliance, privacy
└── troubleshooting.md      # Technical issues, errors
```

**Note**: The intent classifier maps queries to these specific filenames. Using other filenames will still work, but queries will be treated as "general" without category filtering.

Supported formats: `.txt`, `.md`, `.json`

### 2. Ingest Documents

Run the ingestion script to process and embed your documents:

```bash
npm run ingest
```

This will:
- Read all files from `/docs`
- Generate embeddings using OpenAI
- Store in Supabase with vector search index

### 3. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ Server started successfully!
🌐 Server running on: http://localhost:3000
💡 Ready to handle customer queries!
```

When processing queries, you'll see detailed logs including intent classification:
```
💬 Processing query: "How do I reset my password?"
🎯 Classifying user intent...
   - Intent classified as: troubleshooting
   - Will filter by source: troubleshooting.md
🔍 Searching for: "How do I reset my password?"
   - Generating query embedding...
   - Query embedded successfully
   - Querying Supabase for top 3 matches...
   ✅ Found 2 relevant document(s)
      1. [Similarity: 0.892] troubleshooting.md
      2. [Similarity: 0.854] troubleshooting.md
🤖 Generating AI response...
✅ Response generated successfully
```

### 4. Test the API

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Ask a Question:**
```bash
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I reset my password?"}'
```

## 📡 API Documentation

### Endpoints

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "AI Customer Support Agent",
  "timestamp": "2025-11-02T10:30:00.000Z"
}
```

---

#### `POST /api/ask`
Submit a customer support query.

**Request Body:**
```json
{
  "query": "How do I upgrade my plan?"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "answer": "To upgrade your plan, go to Settings → Billing → Change Plan...",
  "sources": [
    {
      "id": 1,
      "filename": "billing.md",
      "similarity": "0.892",
      "excerpt": "### How do I upgrade my plan?\nGo to Settings → Billing..."
    },
    {
      "id": 2,
      "filename": "billing.md",
      "similarity": "0.854",
      "excerpt": "### Subscription Plans\nWe offer three tiers: Basic, Pro, and Enterprise..."
    }
  ],
  "metadata": {
    "documentsRetrieved": 2,
    "model": "gpt-4-turbo-preview",
    "timestamp": "2025-11-02T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Invalid query",
  "message": "Query must be at least 3 characters long"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "timestamp": "2025-11-02T10:30:00.000Z"
}
```

---

#### `GET /`
API documentation endpoint.

**Response:**
```json
{
  "service": "AI Customer Support Agent API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

## 🎯 Intent Classification

The system now includes an intelligent intent classification layer that improves retrieval accuracy by categorizing user queries before performing vector search.

### How It Works

1. **Query Analysis**: When a user submits a question, the intent classifier analyzes it using OpenAI
2. **Category Mapping**: The query is mapped to one of seven document categories:
   - `api-documentation` - API endpoints, authentication, webhooks, rate limits
   - `billing` - Pricing, payments, invoices, subscriptions, refunds
   - `faq` - General questions, account management, features
   - `product-info` - Product features, capabilities, pricing tiers
   - `quick-start` - Getting started, onboarding, initial setup
   - `security-privacy` - Security, encryption, compliance, GDPR
   - `troubleshooting` - Technical issues, errors, bugs
   - `general` - Queries spanning multiple categories
3. **Filtered Search**: Vector search is performed with metadata filtering for the identified category
4. **Automatic Fallback**: If no results are found, the system automatically retries without filtering

### Benefits

- **Higher Precision**: Returns more relevant documents by filtering out unrelated content
- **Faster Responses**: Reduced search space means quicker retrieval
- **Better Context**: More focused context leads to more accurate AI responses
- **Graceful Degradation**: Fallback mechanism ensures answers even when classification is uncertain

### Configuration

Intent classification is enabled by default. To disable it for specific queries:

```javascript
// In your code
retrieveRelevantDocuments(query, topK, threshold, useIntentFiltering = false);
```

## 📁 Project Structure

```
ai-customer-support-agent/
├── src/
│   ├── config.js                 # Configuration & client initialization
│   ├── server.js                 # Express API server
│   ├── services/
│   │   ├── ingestDocuments.js    # Document ingestion pipeline
│   │   ├── intentClassifier.js   # Intent classification & filtering
│   │   ├── retrieval.js          # Vector similarity search
│   │   └── ragService.js         # RAG orchestration
│   └── scripts/
│       └── ingest.js             # CLI ingestion script
├── docs/                         # Knowledge base documents
│   ├── api-documentation.md
│   ├── billing.md
│   ├── faq.md
│   ├── product-info.md
│   ├── quick-start.md
│   ├── security-privacy.md
│   └── troubleshooting.md
├── database/
│   ├── schema.sql                # Supabase database schema
│   └── SETUP.md                  # Database setup guide
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🚢 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

### Railway

1. Connect your GitHub repo to Railway
2. Add environment variables
3. Deploy automatically on push

### Traditional Hosting

1. Build and run:
```bash
npm start
```

2. Use PM2 for process management:
```bash
npm i -g pm2
pm2 start src/server.js --name "ai-support-agent"
```

## 🐛 Troubleshooting

### "Knowledge base is empty"
- Run `npm run ingest` to populate the database
- Check that files exist in `/docs` folder
- Verify Supabase connection

### "Extension vector does not exist"
- Run `database/schema.sql` in Supabase SQL Editor
- Ensure pgvector extension is enabled

### "Permission denied for table documents"
- Use `service_role` key, not `anon` key
- Check `.env` has correct `SUPABASE_SERVICE_KEY`

### "OpenAI rate limit exceeded"
- Reduce request frequency
- Upgrade OpenAI plan
- Implement caching

### No relevant documents found
- Lower `SIMILARITY_THRESHOLD` in `.env`
- Add more documents to knowledge base
- Check document quality and relevance
- Try disabling intent filtering temporarily to test: `useIntentFiltering = false`
- Ensure document filenames match the categories in `intentClassifier.js`

### Intent classification failing
- Check OpenAI API key is valid and has credits
- Review logs for classification errors
- System automatically falls back to unfiltered search if classification fails
- Verify `CLASSIFICATION_SYSTEM_PROMPT` in `intentClassifier.js` is appropriate

### Wrong category detected
- Lower classification temperature in `intentClassifier.js` (currently 0.3)
- Update `CLASSIFICATION_SYSTEM_PROMPT` with clearer category descriptions
- Add more specific keywords for each category
- Consider adding example queries to the classification prompt

## 🔧 Customization

### Modify AI Personality
Edit `SYSTEM_PROMPT` in `src/services/ragService.js`

### Adjust Search Parameters
Change `TOP_K_RESULTS` and `SIMILARITY_THRESHOLD` in `.env`

### Customize Intent Categories
Add or modify categories in `src/services/intentClassifier.js`:
```javascript
export const DOCUMENT_CATEGORIES = {
  API_DOCUMENTATION: 'api-documentation.md',
  BILLING: 'billing.md',
  // Add your custom categories here
  CUSTOM_CATEGORY: 'custom-docs.md',
};
```

Update the classification prompt to include new categories.

### Adjust Classification Temperature
Lower temperature for more consistent classification, higher for more flexibility:
```javascript
// In intentClassifier.js
temperature: 0.3, // Range: 0.0 to 2.0
```

### Disable Intent Classification
Set `useIntentFiltering` to `false` in retrieval calls:
```javascript
retrieveRelevantDocuments(query, topK, threshold, false);
```

### Add Document Chunking
Use `chunkText()` function in `src/services/ingestDocuments.js` for large documents

### Add Logging
Integrate Winston or Pino for structured logging

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request

## 📄 License

Apache License - see LICENSE file for details
