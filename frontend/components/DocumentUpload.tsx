'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from './AuthContext'

interface UploadState {
  uploading: boolean
  progress: number
  success: boolean
  error: string | null
}

export default function DocumentUpload() {
  const { token, permissions } = useAuth()
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    success: false,
    error: null
  })
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setUploadState(prev => ({ ...prev, error: 'Only PDF files are supported' }))
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB
      setUploadState(prev => ({ ...prev, error: 'File size must be less than 50MB' }))
      return
    }

    setUploadState({ uploading: true, progress: 0, success: false, error: null })

    try {
      const formData = new FormData()
      formData.append('document', file)

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setUploadState({ uploading: false, progress: 100, success: true, error: null })
      
      // Trigger refresh of document list (in a real app, use state management)
      window.dispatchEvent(new CustomEvent('documentUploaded', { detail: result }))
      
      // Reset after 3 seconds
      setTimeout(() => {
        setUploadState({ uploading: false, progress: 0, success: false, error: null })
      }, 3000)

    } catch (error) {
      setUploadState({
        uploading: false,
        progress: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      })
    }
  }

  // Check if user has upload permission
  if (!permissions?.canUploadDocuments) {
    return (
      <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-800">Upload Restricted</p>
          <p className="text-sm text-yellow-700">You don't have permission to upload documents.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploadState.uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploadState.uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-gray-600">Uploading document...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>
          </div>
        ) : uploadState.success ? (
          <div className="space-y-3">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600" />
            <p className="text-sm text-green-700 font-medium">Document uploaded successfully!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your PDF here or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PDF files up to 50MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadState.error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{uploadState.error}</p>
        </div>
      )}

      {/* Format Info */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-900 font-medium">Supported formats:</p>
          <p className="text-blue-700">
            PDF documents including committee minutes, invoices, contracts, and reports
          </p>
        </div>
      </div>
    </div>
  )
} 