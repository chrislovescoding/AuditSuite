'use client'

import { useState, useEffect } from 'react'
import { FileText, MessageSquare, Calendar, HardDrive } from 'lucide-react'
import DocumentChat from './DocumentChat'
import { useAuth } from './AuthContext'

interface Document {
  id: string
  originalName: string
  size: number
  uploadDate: string
}

export default function DocumentList() {
  const { token } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const docs = await response.json()
        setDocuments(docs)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocuments()

    // Listen for new uploads
    const handleDocumentUpload = () => {
      fetchDocuments()
    }

    window.addEventListener('documentUploaded', handleDocumentUpload)
    return () => window.removeEventListener('documentUploaded', handleDocumentUpload)
  }, [token])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No documents uploaded yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Upload a PDF to start analyzing with AI
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Document List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {doc.originalName}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {formatFileSize(doc.size)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(doc.uploadDate)}
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedDoc(doc)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <MessageSquare className="h-4 w-4" />
                Start Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen Chat Modal */}
      {selectedDoc && (
        <DocumentChat
          document={selectedDoc}
          onBack={() => setSelectedDoc(null)}
        />
      )}
    </>
  )
} 