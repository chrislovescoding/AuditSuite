import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

// Import database and migrations
import { db } from './database/config';
import { MigrationRunner } from './database/migrations';
import { UserService } from './services/userService';

// Import authentication middleware and routes
import { authenticateToken, requireDocumentUpload } from './middleware/auth';
import authRoutes from './routes/auth';

// Load environment variables from root .env file
const envPath = path.join(__dirname, '../../.env');

// Handle encoding issues with .env file
try {
  // First try UTF-8
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if it's UTF-16 encoded (lots of null bytes)
  if (envContent.includes('\u0000')) {
    envContent = fs.readFileSync(envPath, 'utf16le');
  }
  
  // Remove BOM if present
  if (envContent.charCodeAt(0) === 0xFEFF) {
    envContent = envContent.slice(1);
  }
  
  // Parse environment variables manually
  const lines = envContent.split(/\r?\n/);
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#') && trimmedLine.includes('=')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=').trim();
      process.env[key.trim()] = value;
    }
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error);
}

// Don't call config() as it might override our manual settings
// config({ path: envPath });

// Debug: Show all environment variables that start with GEMINI
console.log('🔍 All GEMINI env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
console.log('🔍 PORT:', process.env.PORT);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
console.log('🔑 Gemini API Key loaded successfully');

// Lazy database initialization for serverless
let databaseInitialized = false;

async function ensureDatabaseInitialized() {
  if (databaseInitialized) {
    return;
  }

  try {
    console.log('🗄️ Initializing database lazily...');
    
    // Test database connection
    const client = await db.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection test successful');
    
    // Only run migrations if needed - check if tables exist first
    const tablesExist = await checkTablesExist();
    if (!tablesExist) {
      console.log('📋 Running database migrations...');
      await MigrationRunner.runMigrations();
      await UserService.initializeDefaultAdmin();
    }
    
    databaseInitialized = true;
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
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
app.use(express.json());

// Add middleware to ensure database is initialized before processing requests
app.use(async (req, res, next) => {
  // Skip database initialization for health checks
  if (req.path === '/api/health') {
    return next();
  }
  
  try {
    await ensureDatabaseInitialized();
    next();
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueId}${extension}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// In-memory storage for documents (replace with PostgreSQL later)
interface Document {
  id: string;
  filename: string;
  originalName: string;
  filepath: string;
  uploadDate: Date;
  size: number;
}

const documents: Map<string, Document> = new Map();

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

    const documentId = path.basename(req.file.filename, path.extname(req.file.filename));
    const document: Document = {
      id: documentId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filepath: req.file.path,
      uploadDate: new Date(),
      size: req.file.size
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

    // Read the PDF file
    const fileBuffer = fs.readFileSync(document.filepath);
    
    // Use Gemini to analyze the document
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: 'application/pdf'
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

    // Store document temporarily for this scan
    const documentId = path.basename(req.file.filename, path.extname(req.file.filename));
    const document: Document = {
      id: documentId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filepath: req.file.path,
      uploadDate: new Date(),
      size: req.file.size
    };

    // Read the PDF file
    const fileBuffer = fs.readFileSync(document.filepath);
    
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
          mimeType: 'application/pdf'
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

    // Clean up the file after a delay (optional - for demo purposes)
    setTimeout(() => {
      try {
        fs.unlinkSync(document.filepath);
        documents.delete(documentId);
      } catch (err) {
        console.warn('Failed to cleanup temporary file:', err);
      }
    }, 10 * 60 * 1000); // 10 minutes

    res.json({
      ...scanResults,
      documentUrl: `http://localhost:5000${documentUrl}`,
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

  if (!fs.existsSync(document.filepath)) {
    return res.status(404).json({ error: 'Document file not found' });
  }

  // Set headers to allow iframe embedding and proper PDF display
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${document.originalName}"`);
  
  // Remove CSP restrictions for PDF iframe embedding
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', 'frame-ancestors \'self\' http://localhost:3000 https://localhost:3000');
  
  // Enable CORS for cross-origin iframe access
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  const fileStream = fs.createReadStream(document.filepath);
  fileStream.pipe(res);
});

// Alternative authenticated download endpoint for permanent documents
app.get('/api/documents/:id/download-secure', authenticateToken, (req, res) => {
  const { id } = req.params;
  const document = documents.get(id);
  
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (!fs.existsSync(document.filepath)) {
    return res.status(404).json({ error: 'Document file not found' });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
  
  const fileStream = fs.createReadStream(document.filepath);
  fileStream.pipe(res);
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
    console.log(`📁 Uploads directory: ${uploadsDir}`);
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