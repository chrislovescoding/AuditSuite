import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

// Import database and migrations
import { db } from './database/config';
import { MigrationRunner } from './database/migrations';
import { UserService } from './services/userService';

// Import authentication middleware and routes
import { authenticateToken, requireDocumentUpload } from './middleware/auth';
import authRoutes from './routes/auth';

// Properly configure environment variables
if (process.env.NODE_ENV !== 'production') {
  config({ path: path.join(__dirname, '../../.env') });
}

// Environment validation
const requiredEnvVars = ['GEMINI_API_KEY', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const IS_SERVERLESS = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Database initialization promise (singleton pattern)
let dbInitPromise: Promise<void> | null = null;

async function initializeDatabase(): Promise<void> {
  if (dbInitPromise) {
    return dbInitPromise;
  }

  dbInitPromise = (async () => {
    try {
      console.log('🗄️ Initializing database...');
      
      // Test database connection
      const client = await db.connect();
      await client.query('SELECT 1');
      client.release();
      
      // Check if migrations are needed
      const tablesExist = await checkTablesExist();
      if (!tablesExist) {
        console.log('📋 Running database migrations...');
        await MigrationRunner.runMigrations();
        await UserService.initializeDefaultAdmin();
      }
      
      console.log('✅ Database initialization complete');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      dbInitPromise = null; // Reset promise to allow retry
      throw error;
    }
  })();

  return dbInitPromise;
}

async function checkTablesExist(): Promise<boolean> {
  try {
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      frameAncestors: ["'self'", "http://localhost:3000", "https://localhost:3000"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Reasonable JSON limit

// Database initialization middleware - only for non-health endpoints
app.use(async (req, res, next) => {
  if (req.path === '/api/health') {
    return next();
  }
  
  try {
    await initializeDatabase();
    next();
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'Database connection failed' 
    });
  }
});

// File upload configuration
const configureMulter = () => {
  // Always use memory storage for serverless environments
  if (IS_SERVERLESS) {
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit for serverless
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
          cb(null, true);
        } else {
          cb(new Error('Only PDF files are allowed'));
        }
      }
    });
  }

  // For local development, use disk storage
  const uploadsDir = path.join(__dirname, '../uploads');
  
  return multer({
    storage: multer.diskStorage({
      destination: async (req, file, cb) => {
        try {
          await fs.mkdir(uploadsDir, { recursive: true });
          cb(null, uploadsDir);
        } catch (error) {
          cb(error as Error, '');
        }
      },
      filename: (req, file, cb) => {
        const uniqueId = uuidv4();
        const extension = path.extname(file.originalname);
        cb(null, `${uniqueId}${extension}`);
      }
    }),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB for local development
      files: 1,
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed'));
      }
    }
  });
};

const upload = configureMulter();

// Document interface optimized for serverless
interface Document {
  id: string;
  originalName: string;
  buffer: Buffer;
  uploadDate: Date;
  size: number;
  mimeType: string;
}

// In-memory storage (should be replaced with database/cloud storage in production)
const documents = new Map<string, Document>();

// Utility functions
async function getFileBuffer(file: Express.Multer.File): Promise<Buffer> {
  if (file.buffer) {
    return file.buffer;
  }
  
  if (file.path) {
    return await fs.readFile(file.path);
  }
  
  throw new Error('File data not available');
}

function cleanupDocument(documentId: string, delay: number = 10 * 60 * 1000) {
  setTimeout(() => {
    documents.delete(documentId);
    console.log(`🧹 Cleaned up document: ${documentId}`);
  }, delay);
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Protected document routes
// Upload document - requires authentication and upload permission
app.post('/api/documents/upload', 
  authenticateToken,
  requireDocumentUpload,
  upload.single('document'), 
  async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documentId = uuidv4();
    const fileBuffer = await getFileBuffer(req.file);
    
    const document: Document = {
      id: documentId,
      originalName: req.file.originalname,
      buffer: fileBuffer,
      uploadDate: new Date(),
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    documents.set(documentId, document);

    res.json({
      id: documentId,
      originalName: document.originalName,
      size: document.size,
      uploadDate: document.uploadDate
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get all documents - requires authentication
app.get('/api/documents', authenticateToken, (req, res) => {
  const documentList = Array.from(documents.values()).map(doc => ({
    id: doc.id,
    originalName: doc.originalName,
    size: doc.size,
    uploadDate: doc.uploadDate
  }));
  
  res.json(documentList);
});

// Chat with document - requires authentication
app.post('/api/documents/:id/chat', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const document = documents.get(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Use Gemini to analyze the document
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: document.buffer.toString('base64'),
          mimeType: document.mimeType
        }
      },
      `Please analyze this document and answer the following question: ${question}
      
      Context: This is a document from a UK local government audit. Please provide accurate, relevant information and cite specific sections where possible.`
    ]);

    const response = await result.response;
    const text = response.text();

    res.json({
      question,
      answer: text,
      documentName: document.originalName,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process question' });
  }
});

// Get document details - requires authentication
app.get('/api/documents/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const document = documents.get(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  res.json({
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadDate: document.uploadDate
  });
});

// Document scanning endpoint - requires authentication and upload permission
app.post('/api/documents/scan', 
  authenticateToken,
  requireDocumentUpload,
  upload.single('file'), 
  async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { searchTerm } = req.body;
    if (!searchTerm || !searchTerm.trim()) {
      return res.status(400).json({ error: 'Search term is required' });
    }

    // Get file buffer and create temporary document
    const documentId = uuidv4();
    const fileBuffer = await getFileBuffer(req.file);
    
    const document: Document = {
      id: documentId,
      originalName: req.file.originalname,
      buffer: fileBuffer,
      uploadDate: new Date(),
      size: req.file.size,
      mimeType: req.file.mimetype
    };

    // Use Gemini to scan the document for the specific topic
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Please analyze this PDF document and find all text snippets that relate to or mention "${searchTerm}".

For each relevant passage you find:
1. Extract the exact text that mentions or relates to "${searchTerm}"
2. Indicate which page it appears on (1-based numbering)
3. Rate the relevance/confidence on a scale of 0.0 to 1.0
4. If possible, provide approximate position information (you can estimate based on typical PDF layout)

Please return your response in this exact JSON format:
{
  "searchTerm": "${searchTerm}",
  "totalMatches": <number of matches found>,
  "results": [
    {
      "text": "<exact text passage that mentions the topic>",
      "page": <page number>,
      "confidence": <relevance score from 0.0 to 1.0>,
      "position": {
        "x": <estimated x coordinate (0-600 typical range)>,
        "y": <estimated y coordinate (0-800 typical range)>,
        "width": <estimated text width (50-400 typical range)>,
        "height": <estimated text height (10-20 typical range)>
      }
    }
  ]
}

Context: This is a document from a UK local government audit. Focus on finding passages that directly reference or are highly relevant to "${searchTerm}". Include surrounding context to make the snippets meaningful.

For position estimates:
- x: horizontal position from left margin (0 = left edge, 600 = right edge for typical A4)
- y: vertical position from top (0 = top, 800 = bottom for typical A4)
- width: approximate width of the text snippet
- height: approximate height of the text (usually 12-16 for normal text)

Return only the JSON response, no additional text.`;
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: document.mimeType
        }
      },
      prompt
    ]);

    const response = await result.response;
    let text = response.text();
    
    // Clean up the response to extract JSON
    text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
    
    let scanResults;
    try {
      scanResults = JSON.parse(text);
      
      // Ensure all results have position data, add defaults if missing
      if (scanResults.results) {
        scanResults.results = scanResults.results.map((result: any) => ({
          ...result,
          position: result.position || {
            x: 50, // Default left margin
            y: 100, // Default top position
            width: 400, // Default width
            height: 14 // Default text height
          }
        }));
      }
      
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // Fallback response structure
      scanResults = {
        searchTerm: searchTerm.trim(),
        totalMatches: 0,
        results: []
      };
    }

    // Create a public URL for the document (for preview)
    const documentUrl = `/api/documents/${documentId}/download`;

    // Temporarily store document for download access
    documents.set(documentId, document);

    // Clean up the file after a delay
    cleanupDocument(documentId);

    res.json({
      ...scanResults,
      documentUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}${documentUrl}`,
      fileName: document.originalName
    });

  } catch (error) {
    console.error('Document scan error:', error);
    res.status(500).json({ error: 'Failed to scan document' });
  }
});

// Download document endpoint - for accessing scanned documents
app.get('/api/documents/:id/download', (req, res) => {
  const { id } = req.params;
  const document = documents.get(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const fileBuffer = document.buffer;
    
    // Set headers to allow iframe embedding and proper PDF display
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
    
    // Remove CSP restrictions for PDF iframe embedding
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', 'frame-ancestors \'self\' http://localhost:3000 https://localhost:3000');
    
    // Enable CORS for cross-origin iframe access
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(404).json({ error: 'Document file not found' });
  }
});

// Alternative authenticated download endpoint for permanent documents
app.get('/api/documents/:id/download-secure', authenticateToken, (req, res) => {
  const { id } = req.params;
  const document = documents.get(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  try {
    const fileBuffer = document.buffer;
    
    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(404).json({ error: 'Document file not found' });
  }
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// For Vercel serverless deployment
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 AuditSuite backend running on port ${PORT}`);
    console.log(`📁 Uploads directory: ${path.join(__dirname, '../uploads')}`);
    console.log(`🗄️ Database: PostgreSQL connected`);
    console.log(`🔐 Authentication: JWT enabled`);
    console.log(`📊 Audit logging: Enabled`);
  });
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await db.end();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  try {
    await db.end();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}); 