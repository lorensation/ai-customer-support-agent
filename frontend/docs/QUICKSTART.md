# Quick Start Guide - AI Customer Support Agent

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install packages
npm install
```

### Step 2: Configure Environment

```bash
# Copy example env file
cp .env.local.example .env.local
```

**Edit `.env.local` with your keys**:

```env
# Backend (your Node.js server - must be running!)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-key-here

# Supabase (same as backend .env)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Tavily API Key (get free at https://tavily.com)
TAVILY_API_KEY=tvly-your-key-here
```

### Step 3: Start Backend

```bash
# In root directory (parent folder)
cd ..
npm start
```

Make sure backend is running on `http://localhost:3000`

### Step 4: Start Frontend

```bash
# In frontend directory
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3001`

### Step 5: Test It!

Open `http://localhost:3001` and try:

- "How do I get started with the API?" *(should use retrieval)*
- "What are the latest AI trends?" *(should trigger web search)*

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Check backend is running: `http://localhost:3000/health`
- Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`

### "OpenAI API error"
- Verify your `OPENAI_API_KEY` is valid
- Check your OpenAI account has credits

### "Tavily API error"
- Get free API key at https://tavily.com
- Verify `TAVILY_API_KEY` in `.env.local`
- Web search will be disabled if key is missing

### "No documents found"
- Run backend ingestion: `npm run ingest` (in root directory)
- Verify Supabase has documents in `customer-support-docs` table

---

## 📦 What Gets Installed?

Core dependencies:
- `next` - React framework
- `ai` - Vercel AI SDK for streaming
- `langchain` - AI orchestration
- `@langchain/openai` - OpenAI integration
- `zod` - Schema validation
- `tailwindcss` - Styling
- `lucide-react` - Icons

Total install size: ~500MB (includes TypeScript, React, etc.)

---

## 🎯 Next Steps

1. **Customize branding** → Edit `components/Sidebar.tsx`
2. **Adjust system prompt** → Edit `app/api/ask/route.ts`
3. **Configure confidence threshold** → Set `CONFIDENCE_THRESHOLD` in `.env.local`
4. **Deploy to Vercel** → Follow deployment guide in main README

---

**Need help?** Check the full README.md for detailed documentation.
