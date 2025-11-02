/**
 * Express API Server
 * 
 * Provides REST API endpoints for the AI Customer Support Agent.
 * Main endpoint: POST /api/ask - accepts user queries and returns AI-generated responses
 * 
 * Features:
 * - CORS support for frontend integration
 * - Request validation and error handling
 * - Health check endpoint
 * - Comprehensive logging
 */

import express from 'express';
import cors from 'cors';
import { SERVER_CONFIG } from './config.js';
import { generateSupportResponse, validateQuery } from './services/ragService.js';
import { verifyKnowledgeBaseExists } from './services/retrieval.js';

// Initialize Express app
const app = express();

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// --- Routes ---

/**
 * Health check endpoint
 * GET /health
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AI Customer Support Agent',
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.nodeEnv
  });
});

/**
 * Main query endpoint
 * POST /api/ask
 * 
 * Request body:
 * {
 *   "query": "How do I reset my password?"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "answer": "To reset your password...",
 *   "sources": [...],
 *   "metadata": {...}
 * }
 */
app.post('/api/ask', async (req, res) => {
  try {
    const { query } = req.body;

    // Validate request has query field
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: query',
        message: 'Please provide a "query" field in the request body'
      });
    }

    // Validate query content
    const validation = validateQuery(query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid query',
        message: validation.message
      });
    }

    // Process query through RAG pipeline
    const response = await generateSupportResponse(query);

    // Return response with appropriate status code
    const statusCode = response.success ? 200 : 500;
    res.status(statusCode).json(response);

  } catch (error) {
    console.error('❌ Unhandled error in /api/ask:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Root endpoint - API documentation
 * GET /
 */
app.get('/', (req, res) => {
  res.json({
    service: 'AI Customer Support Agent API',
    version: '1.0.0',
    endpoints: {
      health: {
        method: 'GET',
        path: '/health',
        description: 'Check service health status'
      },
      ask: {
        method: 'POST',
        path: '/api/ask',
        description: 'Submit a customer support query',
        body: {
          query: 'string (required) - The customer question'
        }
      }
    },
    documentation: 'See README.md for full API documentation'
  });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableEndpoints: ['GET /', 'GET /health', 'POST /api/ask']
  });
});

// --- Error Handler ---
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// --- Server Startup ---

/**
 * Starts the Express server after validating prerequisites
 */
async function startServer() {
  try {
    console.log('\n🚀 Starting AI Customer Support Agent...\n');

    // Verify knowledge base exists
    console.log('📚 Verifying knowledge base...');
    const hasDocuments = await verifyKnowledgeBaseExists();
    
    if (!hasDocuments) {
      console.warn('\n⚠️  WARNING: Knowledge base is empty!');
      console.warn('   Run "npm run ingest" to populate the knowledge base.\n');
    }

    // Start listening
    app.listen(SERVER_CONFIG.port, () => {
      console.log('\n✅ Server started successfully!');
      console.log(`\n🌐 Server running on: http://localhost:${SERVER_CONFIG.port}`);
      console.log(`📝 Environment: ${SERVER_CONFIG.nodeEnv}`);
      console.log('\n📡 Available endpoints:');
      console.log(`   - GET  http://localhost:${SERVER_CONFIG.port}/health`);
      console.log(`   - POST http://localhost:${SERVER_CONFIG.port}/api/ask`);
      console.log('\n💡 Ready to handle customer queries!\n');
    });

  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
