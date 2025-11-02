# AI Customer Support Agent 🤖

A production-ready AI customer support agent powered by **Retrieval-Augmented Generation (RAG)** using Node.js, OpenAI, and Supabase pgvector.

## 🌟 Features

- **Semantic Search**: Vector similarity search using Supabase pgvector
- **RAG Pipeline**: Context-aware responses based on your knowledge base
- **REST API**: Simple `/api/ask` endpoint for easy integration
- **Modular Architecture**: Clean separation of concerns for maintainability
- **Production Ready**: Error handling, logging, and validation
- **OpenAI Integration**: GPT-4 for responses, text-embedding-3-small for vectors
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
                    1. Generate Query Embedding
                              ↓
                    2. Search Vector Database (Supabase)
                              ↓
                    3. Retrieve Top K Documents
                              ↓
                    4. Build Context + Prompt
                              ↓
                    5. Generate Response (OpenAI GPT-4)
                              ↓
                    6. Return Answer + Sources
```

### Core Components

- **`config.js`**: Centralized configuration and client initialization
- **`ingestDocuments.js`**: ETL pipeline for knowledge base documents
- **`retrieval.js`**: Vector similarity search with Supabase pgvector
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
- `documents` table with pgvector support
- `match_documents()` function for similarity search
- Necessary indexes and triggers

📖 See [database/SETUP.md](database/SETUP.md) for detailed instructions.

### 3. Get API Keys
In Supabase dashboard: **Settings** → **API**
- Copy **Project URL** → `SUPABASE_URL`
- Copy **service_role key** → `SUPABASE_SERVICE_KEY`

⚠️ **Important**: Use the `service_role` key, not the `anon` key!

## 📚 Usage

### 1. Add Knowledge Base Documents

Add your documentation files to the `/docs` folder:
```
docs/
├── product-info.md
├── faq.md
├── quick-start.md
└── policies.txt
```

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
      "filename": "faq.md",
      "similarity": "0.892",
      "excerpt": "### How do I upgrade my plan?\nGo to Settings → Billing..."
    }
  ],
  "metadata": {
    "documentsRetrieved": 3,
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

## 📁 Project Structure

```
ai-customer-support-agent/
├── src/
│   ├── config.js                 # Configuration & client initialization
│   ├── server.js                 # Express API server
│   ├── services/
│   │   ├── ingestDocuments.js    # Document ingestion pipeline
│   │   ├── retrieval.js          # Vector similarity search
│   │   └── ragService.js         # RAG orchestration
│   └── scripts/
│       └── ingest.js             # CLI ingestion script
├── docs/                         # Knowledge base documents
│   ├── product-info.md
│   ├── faq.md
│   └── quick-start.md
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

## 🔧 Customization

### Modify AI Personality
Edit `SYSTEM_PROMPT` in `src/services/ragService.js`

### Adjust Search Parameters
Change `TOP_K_RESULTS` and `SIMILARITY_THRESHOLD` in `.env`

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

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- OpenAI for GPT-4 and embeddings
- Supabase for pgvector hosting
- Express.js for the API framework

## 📞 Support

- 📧 Email: support@yourdomain.com
- 💬 Discord: [your-discord-link]
- 📚 Documentation: [your-docs-link]

---

**Built with ❤️ for better customer support**
