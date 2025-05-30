import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'
import { Shield, FileText, MessageSquare, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">AuditSuite</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl">
          AI-powered document analysis for UK local government audit. 
          Upload documents and chat with them using advanced AI.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h3 className="font-semibold">Document Upload</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Securely upload PDFs including committee minutes, invoices, and contracts
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className="h-6 w-6 text-green-600" />
            <h3 className="font-semibold">AI Chat</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Ask questions about your documents using natural language
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <h3 className="font-semibold">Audit Analytics</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Extract insights and identify anomalies with AI-powered analysis
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold mb-4">Upload Document</h2>
          <DocumentUpload />
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Documents</h2>
          <DocumentList />
        </div>
      </div>
    </main>
  )
} 