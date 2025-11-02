# 🚀 AI Customer Support Agent - Command Reference

## Quick Command Guide

All commands assume you're in the `frontend/` directory unless specified.

---

## 📦 Installation & Setup

### First-Time Setup
```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local with your API keys (use your text editor)
code .env.local  # VS Code
notepad .env.local  # Windows
nano .env.local  # Linux/Mac
```

---

## 🏃 Development

### Start Development Server
```bash
# Start Next.js dev server (with hot reload)
npm run dev

# Server starts at: http://localhost:3001
# API routes at: http://localhost:3001/api/*
```

### Start Backend (Separate Terminal)
```bash
# Navigate to root directory
cd ..

# Start Node.js backend
npm start

# Backend runs at: http://localhost:3000
```

### Both at Once (Windows PowerShell)
```powershell
# Start both servers
Start-Process powershell -ArgumentList "cd ..; npm start"
Start-Process powershell -ArgumentList "cd frontend; npm run dev"
```

---

## 🏗️ Building

### Production Build
```bash
# Create optimized production build
npm run build

# Output: .next/ directory with optimized files
# Build time: ~30-60 seconds
```

### Start Production Server
```bash
# Start production build locally
npm start

# Serves optimized build at http://localhost:3001
```

### Build Info
```bash
# View build size and bundle analysis
npm run build -- --profile

# Check for errors without building
npm run lint
```

---

## 🧪 Testing & Validation

### Type Checking
```bash
# Check TypeScript types (no compilation)
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

### Linting
```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Format Code (if Prettier is installed)
```bash
# Check formatting
npx prettier --check .

# Auto-format
npx prettier --write .
```

---

## 🔧 Maintenance

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all to latest compatible versions
npm update

# Update Next.js specifically
npm install next@latest

# Update all dependencies to latest (breaking changes possible)
npm install $(npm outdated | awk 'NR>1 {print $1"@latest"}')
```

### Clean Rebuild
```bash
# Remove build artifacts and dependencies
rm -rf .next node_modules

# Reinstall (Windows)
rmdir /s /q .next node_modules
npm install

# Reinstall everything
npm install
npm run build
```

### Check Bundle Size
```bash
# Analyze bundle with built-in analyzer
ANALYZE=true npm run build

# Or add to package.json:
# "analyze": "ANALYZE=true next build"
# Then: npm run analyze
```

---

## 🌐 Environment Management

### View Current Environment
```bash
# List environment variables (Node.js)
node -e "console.log(process.env)"

# Check specific variable
echo $OPENAI_API_KEY  # Linux/Mac
echo %OPENAI_API_KEY%  # Windows CMD
echo $env:OPENAI_API_KEY  # Windows PowerShell
```

### Test API Keys
```bash
# Test OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Tavily key (Windows PowerShell)
Invoke-RestMethod -Uri "https://api.tavily.com/search" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"api_key":"YOUR_KEY","query":"test"}'

# Test Supabase connection
curl -X GET "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $SUPABASE_ANON_KEY"
```

---

## 📊 Monitoring & Debugging

### View Logs
```bash
# Development logs (console output)
npm run dev | tee logs.txt

# Production logs
npm start 2>&1 | tee production.log
```

### Debug Mode
```bash
# Start with Node.js inspector
NODE_OPTIONS='--inspect' npm run dev

# Connect Chrome DevTools to:
# chrome://inspect
```

### Check API Routes
```bash
# Test /api/ask endpoint
curl -X POST http://localhost:3001/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query":"How do I get started?"}'

# Windows PowerShell version
Invoke-RestMethod -Uri "http://localhost:3001/api/ask" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"query":"How do I get started?"}'
```

---

## 🚀 Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Build for Deployment
```bash
# Production build
npm run build

# Test production build locally
npm start
```

### Environment for Vercel
```bash
# Add environment variables via CLI
vercel env add OPENAI_API_KEY
vercel env add TAVILY_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY

# Or use Vercel dashboard:
# https://vercel.com/your-project/settings/environment-variables
```

---

## 🔍 Troubleshooting Commands

### Clear Cache
```bash
# Clear Next.js cache
rm -rf .next/cache

# Windows
rmdir /s /q .next\cache

# Clear all .next
rm -rf .next
```

### Reset Node Modules
```bash
# Full reset
rm -rf node_modules package-lock.json
npm install

# Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Check Ports
```bash
# Check if port 3001 is in use (Linux/Mac)
lsof -i :3001

# Windows
netstat -ano | findstr :3001

# Kill process on port (Linux/Mac)
kill -9 $(lsof -t -i:3001)

# Windows
taskkill /PID <PID> /F
```

### Fix Permission Issues (Linux/Mac)
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules
```

---

## 📚 Documentation Commands

### Generate Documentation
```bash
# TypeScript documentation (if installed)
npx typedoc --out docs src

# Component documentation
npx react-docgen src/components/**/*.tsx > component-docs.json
```

### View README Files
```bash
# View in terminal
cat README.md

# Open in browser (if markdown viewer installed)
code README.md  # VS Code
```

---

## 🧰 Utility Commands

### Count Lines of Code
```bash
# All TypeScript files
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Specific directory
wc -l src/components/**/*.tsx
```

### Find Files
```bash
# Find all components
find src -name "*.tsx"

# Find TODO comments
grep -r "TODO" src/

# Find console.logs (for cleanup)
grep -r "console\." src/
```

### Git Commands
```bash
# Stage all frontend changes
git add frontend/

# Commit with message
git commit -m "feat: Add AI customer support frontend"

# Push to GitHub
git push origin main

# Create new branch
git checkout -b feature/your-feature
```

---

## 🔑 Environment Variable Reference

### Required Variables

```bash
# Backend URL (your Node.js server)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# OpenAI API Key
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://....supabase.co
SUPABASE_ANON_KEY=eyJ...

# Tavily API Key
TAVILY_API_KEY=tvly-...
```

### Optional Variables

```bash
# Confidence threshold (default: 0.6)
CONFIDENCE_THRESHOLD=0.6

# LangChain tracing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=ls__...

# Next.js port (default: 3000)
PORT=3001
```

---

## 📦 NPM Scripts Reference

### Available Scripts

```json
{
  "dev": "next dev",           // Start dev server
  "build": "next build",       // Production build
  "start": "next start",       // Start prod server
  "lint": "next lint"          // Run ESLint
}
```

### Custom Scripts (add to package.json)

```json
{
  "type-check": "tsc --noEmit",
  "format": "prettier --write .",
  "analyze": "ANALYZE=true next build",
  "clean": "rm -rf .next node_modules",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

---

## 🎯 Common Workflows

### 1. Daily Development
```bash
# Start backend
cd .. && npm start &

# Start frontend
cd frontend && npm run dev
```

### 2. Before Committing
```bash
# Check types
npx tsc --noEmit

# Run linter
npm run lint

# Test build
npm run build
```

### 3. Deploying to Production
```bash
# Pull latest
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Deploy
vercel --prod
```

### 4. Debugging Issues
```bash
# Clear everything
npm run clean

# Reinstall
npm install

# Rebuild
npm run build

# Check types
npx tsc --noEmit

# Start fresh
npm run dev
```

---

## 🆘 Quick Fixes

### "Module not found" errors
```bash
npm install
npm run build
```

### "Port already in use"
```bash
# Kill process on port 3001
npx kill-port 3001

# Or use different port
PORT=3002 npm run dev
```

### "Type errors"
```bash
# Reinstall type definitions
npm install -D @types/node @types/react @types/react-dom

# Check TypeScript version
npx tsc --version
```

### "Build fails"
```bash
# Clear build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

---

## 📞 Help & Support

### Get Version Info
```bash
# Node.js version
node --version

# npm version
npm --version

# Next.js version
npx next --version

# All dependencies
npm list --depth=0
```

### Generate Support Info
```bash
# System info
npx envinfo --system --binaries --browsers

# Package info
npm ls next react typescript

# Save to file
npm ls > dependencies.txt
```

---

**💡 Tip**: Bookmark this file for quick reference during development!

**🔗 Related Docs**:
- `README.md` - Full documentation
- `QUICKSTART.md` - 5-minute setup
- `ARCHITECTURE.md` - System design
- `TROUBLESHOOTING.md` - Common issues
