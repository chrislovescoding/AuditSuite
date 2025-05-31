# AuditSuite 🛡️

AI-powered document analysis platform for UK local government audit. Upload PDFs and chat with them using advanced AI.

## Features ✨

- **📄 PDF Upload**: Secure document ingestion with 50MB limit
- **🤖 AI Chat**: Chat with documents using Google Gemini AI with markdown rendering support
- **📝 Rich Formatting**: AI responses support markdown formatting including tables, lists, code blocks, and links
- **🔍 Document Analysis**: Extract insights from committee minutes, invoices, contracts
- **💾 Document Management**: Track uploads with metadata and versioning
- **🎨 Modern UI**: Clean, responsive interface built with Next.js and Tailwind

## Tech Stack 🚀

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, React Markdown, Syntax Highlighting
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini API for document understanding
- **Database**: PostgreSQL (planned - currently in-memory)
- **Storage**: Local filesystem (planned - S3)

## Quick Start 🏃‍♂️

### Prerequisites

- Node.js 18+
- Google Gemini API key

### Installation

1. **Clone the repository**

```bash
git clone <repo-url>
cd audit-suite
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

4. **Start development servers**

```bash
# From root directory
npm run dev
```

This starts:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints 📡

### Document Upload

```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: PDF file (max 50MB)
```

### Chat with Document

```http
POST /api/documents/:id/chat
Content-Type: application/json

{
  "question": "What are the key findings?"
}
```

### List Documents

```http
GET /api/documents
```

## Environment Variables 🔧

### Backend (.env)

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Roadmap 🗺️

### Phase 0: POC ✅

- [X] Basic document upload
- [X] PDF chat with Gemini
- [X] Simple UI

### Phase 1: Foundation

- [X] PostgreSQL integration
- [X] User authentication
- [ ] S3 file storage
- [ ] Document versioning

### Phase 2: AI Features

- [ ] Mistral OCR integration
- [ ] Full-text search
- [ ] Anomaly detection
- [ ] Financial data extraction

### Phase 3: Audit Tools

- [ ] Compliance checking
- [ ] Risk scoring
- [ ] Automated reporting
- [ ] Workflow management

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License 📝

MIT License - see LICENSE file for details
