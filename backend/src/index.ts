import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables from root .env file
config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

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

// Upload document
app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
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

// Get all documents
app.get('/api/documents', (req, res) => {
  const documentList = Array.from(documents.values()).map(doc => ({
    id: doc.id,
    originalName: doc.originalName,
    size: doc.size,
    uploadDate: doc.uploadDate
  }));
  
  res.json(documentList);
});

// Chat with document
app.post('/api/documents/:id/chat', async (req, res) => {
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
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

// Get document details
app.get('/api/documents/:id', (req, res) => {
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

app.listen(PORT, () => {
  console.log(`🚀 AuditSuite backend running on port ${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
}); 