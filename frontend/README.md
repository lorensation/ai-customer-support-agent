# AI Customer Support Agent - Frontend

> **Next.js 14 + LangChain + Vercel AI SDK** • Production-ready AI support with RAG & Web Search

A sophisticated customer support chatbot built with Next.js 14 (App Router), featuring intelligent tool orchestration via LangChain, streaming responses with Vercel AI SDK, and structured validation with Zod.

![Architecture: RAG with Web Search Fallback](https://img.shields.io/badge/Architecture-RAG%20%2B%20Web%20Search-blue)
![Stack: Next.js 14 | LangChain | OpenAI](https://img.shields.io/badge/Stack-Next.js%2014%20%7C%20LangChain%20%7C%20OpenAI-green)

---

## 🎯 Features

### 🤖 **AI-Powered Support**
- **Intelligent RAG Pipeline**: Semantic search through Supabase vector store
- **Web Search Fallback**: Automatic fallback to Tavily when confidence is low
- **Tool Orchestration**: LangChain agents dynamically select optimal tools
- **Streaming Responses**: Real-time response generation with Vercel AI SDK

### 🔒 **Production-Ready**
- **Type-Safe**: Full TypeScript with Zod schema validation
- **Error Handling**: Comprehensive error boundaries and retry logic
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Accessible**: Built with Radix UI primitives

### 🎨 **Modern UI**
- **Clean Chat Interface**: Inspired by modern chat applications
- **Persistent Sidebar**: Product info and navigation always accessible
- **Source Citations**: Transparent source attribution for all responses
- **Dark Mode Ready**: Full theme support (light/dark)

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── ask/
│   │   │       └── route.ts           # Main API endpoint with LangChain agent
│   │   ├── globals.css                # Global styles & theme
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Home page
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── avatar.tsx
│   │   │   └── scroll-area.tsx
│   │   ├── Chat.tsx                   # Main chat component (useChat hook)
│   │   ├── MessageBubble.tsx          # Individual message display
│   │   └── Sidebar.tsx                # Product info sidebar
│   └── lib/
│       ├── langchainTools.ts          # Retrieval & web search tools
│       ├── zodSchemas.ts              # Validation schemas & types
│       └── utils.ts                   # Utility functions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
└── .env.local.example
```

---

## 🧠 Architecture Overview

### Tool-Calling Decision Flow

```
User Query
    ↓
[Intent Analysis]
    ↓
┌─────────────────┐
│ Retrieval Tool  │ ← Always tried first
│ (Supabase RAG)  │
└────────┬────────┘
         ↓
   [Confidence Check]
         ↓
    < 0.6 or No Results?
         ↓
    ┌────┴────┐
    │   YES   │──→  ┌──────────────────┐
    └─────────┘     │ Web Search Tool  │
                    │  (Tavily API)    │
                    └────────┬─────────┘
                             ↓
                    [Combine Results]
                             ↓
                    ┌────────────────┐
                    │  LLM Synthesis │
                    │  (GPT-4 Turbo) │
                    └────────┬───────┘
                             ↓
                    [Stream to Client]
```

### How Tool Selection Works

The system uses a **smart fallback strategy**:

1. **Primary: Retrieval Tool**
   - Queries the existing Node.js backend (`/api/ask`)
   - Backend uses Supabase pgvector for semantic search
   - Intent-based filtering for precise results
   - Returns documents with similarity scores

2. **Secondary: Web Search Tool**
   - **Triggered when**:
     - Retrieval confidence < 0.6
     - No documents found in knowledge base
     - Query contains keywords like "latest", "recent", "current"
   - Uses Tavily API for real-time web search
   - Provides external, up-to-date information

3. **Synthesis**
   - LLM combines both sources intelligently
   - Prioritizes knowledge base for official info
   - Augments with web search for context
   - Cites all sources for transparency

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Backend Running**: Your existing Node.js backend at `http://localhost:3000`
- **API Keys**:
  - OpenAI API key
  - Tavily API key (free at [tavily.com](https://tavily.com))
  - Supabase credentials (from backend)

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```env
   # Backend API (your Node.js Express server)
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

   # OpenAI API Key (for LangChain tools)
   OPENAI_API_KEY=sk-your-actual-key

   # Supabase Configuration (same as backend)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key

   # Web Search API (Tavily)
   TAVILY_API_KEY=tvly-your-actual-key

   # Optional: Confidence threshold (default 0.6)
   CONFIDENCE_THRESHOLD=0.6
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3001
   ```
   *(Uses 3001 to avoid conflict with backend on 3000)*

---

## 🔧 Configuration

### Backend Integration

The frontend connects to your existing Node.js backend:

**Backend Endpoint Used**: `POST /api/ask`

**Request Format**:
```json
{
  "query": "How do I reset my password?"
}
```

**Response Format** (from your backend):
```json
{
  "success": true,
  "answer": "To reset your password...",
  "sources": [
    {
      "id": 1,
      "filename": "faq.md",
      "similarity": "0.856",
      "excerpt": "Password reset instructions..."
    }
  ],
  "metadata": {
    "documentsRetrieved": 3,
    "model": "gpt-4-turbo-preview",
    "timestamp": "2025-11-02T..."
  }
}
```

### Tool Configuration

**Retrieval Tool** (`langchainTools.ts`):
```typescript
// Queries your backend's /api/ask endpoint
createRetrievalTool(BACKEND_URL)
  - Uses intent classification
  - Returns top-K similar documents
  - Includes similarity scores
```

**Web Search Tool** (`langchainTools.ts`):
```typescript
// Tavily API integration
createWebSearchTool(TAVILY_API_KEY)
  - max_results: 3
  - search_depth: "basic"
  - include_answer: true
```

### Confidence Threshold

Control when web search is triggered:

```typescript
// In .env.local
CONFIDENCE_THRESHOLD=0.6  // Default

// Higher = More conservative (less web search)
// Lower = More aggressive (more web search)
```

---

## 🎨 Customization

### Branding

**Update Sidebar** (`components/Sidebar.tsx`):
```typescript
<h1 className="text-xl font-bold">Your Brand Name</h1>
<p className="text-xs">Your Tagline</p>
```

**Colors** (`tailwind.config.ts`):
```typescript
extend: {
  colors: {
    primary: "hsl(221.2 83.2% 53.3%)",  // Change primary color
    // ... other theme colors
  }
}
```

### System Prompt

**Customize Agent Behavior** (`app/api/ask/route.ts`):
```typescript
const AGENT_SYSTEM_PROMPT = `
You are [Your Brand]'s AI support agent.
Your mission: ...
Your tone: ...
Your constraints: ...
`;
```

### Welcome Message

**Update Example Questions** (`components/Chat.tsx`):
```typescript
const exampleQuestions = [
  "Your question 1",
  "Your question 2",
  // ...
];
```

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add frontend"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Root Directory: `frontend`

3. **Configure Environment Variables**
   Add all variables from `.env.local` in Vercel dashboard

4. **Deploy**
   - Vercel auto-deploys on push
   - Production URL: `https://your-app.vercel.app`

### Backend Hosting

Your Node.js backend needs to be accessible:

**Options**:
- **Railway**: Easy Node.js hosting
- **Render**: Free tier available
- **Fly.io**: Edge deployment
- **AWS/GCP**: Full control

**Update Frontend**:
```env
NEXT_PUBLIC_BACKEND_URL=https://your-backend.railway.app
```

---

## 📊 Monitoring & Debugging

### LangChain Tracing

Enable detailed tool execution logs:

```env
# .env.local
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your-langsmith-key
```

Visit [smith.langchain.com](https://smith.langchain.com) to view:
- Tool invocations
- Execution times
- Input/output logs
- Error traces

### Console Logs

The app includes comprehensive logging:

```typescript
// Retrieval Tool
console.log(`🔍 [Retrieval Tool] Searching for: "${query}"`);
console.log(`✅ [Retrieval Tool] Retrieved ${docs.length} documents`);

// Web Search Tool
console.log(`🌐 [Web Search Tool] Searching web for: "${query}"`);
console.log(`✅ [Web Search Tool] Found ${results.length} results`);
```

---

## 🧪 Testing

### Test Retrieval Flow

```bash
# Terminal 1: Backend
cd ..
npm start

# Terminal 2: Frontend
npm run dev
```

**Test Query**: "How do I get started?"
- Should use retrieval tool only
- Check console for tool execution
- Sources should cite knowledge base

### Test Web Search Fallback

**Test Query**: "What are the latest AI trends?"
- Should trigger web search (no KB results)
- Check console for fallback logic
- Sources should include web URLs

### Test Hybrid Approach

**Test Query**: "Compare our security with industry standards"
- Should use both tools
- Retrieval for internal docs
- Web search for industry context

---

## 📚 API Reference

### POST `/api/ask`

**Request**:
```typescript
{
  query: string;        // User question (3-1000 chars)
  sessionId?: string;   // Optional session tracking
  metadata?: object;    // Optional metadata
}
```

**Response** (Streaming):
```
data: AI is analyzing your question...
data: Based on our documentation...
data: [DONE]
```

**Error Response**:
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

---

## 🛠️ Tech Stack Details

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 14 (App Router) | React framework with server components |
| **AI SDK** | Vercel AI SDK | Streaming, chat state management |
| **AI Orchestration** | LangChain | Tool calling, agent workflows |
| **LLM** | OpenAI GPT-4 Turbo | Response generation |
| **Embeddings** | text-embedding-3-small | Vector search (backend) |
| **Vector DB** | Supabase pgvector | Document storage (backend) |
| **Web Search** | Tavily API | Real-time search fallback |
| **Validation** | Zod | Type-safe schemas |
| **UI Components** | Radix UI + shadcn/ui | Accessible components |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Icons** | Lucide React | Icon library |
| **Type Safety** | TypeScript | Full type coverage |

---

## 📖 How It Works: Tool Calling Narrative

When a user sends a question, here's the intelligent decision-making process:

### 1. **Initial Query Reception**
The `useChat()` hook sends the query to `/api/ask`, which initializes a LangChain agent with two tools: `retrieval_tool` and `web_search_tool`.

### 2. **Primary: Knowledge Base Search**
The agent **always starts** with the retrieval tool, which calls your existing Node.js backend. The backend:
- Generates embeddings for the query
- Performs vector similarity search in Supabase
- Applies intent-based filtering (API docs, billing, FAQ, etc.)
- Returns top-K documents with confidence scores

### 3. **Decision Point: Confidence Evaluation**
The agent evaluates the retrieval results:

**HIGH CONFIDENCE (≥0.6)** → Response generated from knowledge base only
```
✅ Retrieved 5 documents (avg: 0.82 confidence)
✅ Sufficient information found
✅ Response generated from internal sources
```

**LOW CONFIDENCE (<0.6)** → Triggers web search fallback
```
⚠️ Retrieved 1 document (avg: 0.45 confidence)
⚠️ Triggering web search for additional context...
🌐 Searching Tavily API...
✅ Combined knowledge base + web results
```

### 4. **Synthesis & Streaming**
The LLM:
- Combines information from all sources
- Prioritizes official knowledge base data
- Augments with web search for completeness
- Streams response token-by-token to the client
- Cites all sources used

### 5. **Client Display**
The frontend:
- Displays streaming response in real-time
- Shows source chips for transparency
- Handles errors gracefully with retry
- Maintains conversation context

---

## 🤝 Contributing

Found a bug or have a feature request? PRs welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- **LangChain**: Powerful AI orchestration framework
- **Vercel AI SDK**: Seamless streaming & chat state
- **Tavily**: Excellent web search API
- **shadcn/ui**: Beautiful component library
- **Supabase**: Scalable vector database

---

## 📞 Support

- **Email**: support@example.com
- **Issues**: [GitHub Issues](https://github.com/yourusername/your-repo/issues)
- **Docs**: See `/docs` folder in backend

---

**Built with ❤️ using LangChain + Next.js + Vercel AI SDK**
