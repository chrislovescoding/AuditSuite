'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Send, Bot, User, Loader2, FileText, Minimize2, Maximize2 } from 'lucide-react'
import MarkdownMessage from './MarkdownMessage'
import { useAuth } from './AuthContext'

interface Document {
  id: string
  originalName: string
  size: number
  uploadDate: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DocumentChatProps {
  document: Document
  onBack: () => void
}

export default function DocumentChat({ document, onBack }: DocumentChatProps) {
  const { token } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch(`/api/documents/${document.id}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage.content }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while analyzing the document. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const suggestedQuestions = [
    "What are the key findings in this document?",
    "Create a summary with bullet points of the main issues",
    "Are there any financial risks mentioned? List them with amounts",
    "Create a table of dates and deadlines mentioned",
    "List any action items or recommendations in a numbered format",
    "What is the overall compliance status?",
    "Are there any urgent issues that need immediate attention?",
    "What are the main recommendations for improvement?"
  ]

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Documents
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Document Chat</h2>
                <p className="text-blue-100 text-sm truncate max-w-md">
                  {document.originalName}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Ready to analyze your document!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Ask me anything about this document. I can help you find key information, summarize content, and answer specific questions.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                    <p className="text-sm font-medium text-gray-700 md:col-span-2 mb-2">Suggested questions to get started:</p>
                    {suggestedQuestions.slice(0, 6).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-left p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                      >
                        <span className="text-sm text-blue-700 font-medium">"{question}"</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md'
                        : 'bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm'
                    } p-4`}
                  >
                    {message.type === 'assistant' ? (
                      <MarkdownMessage 
                        content={message.content}
                        className="prose prose-sm max-w-none"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                    <p className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.type === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <div>
                        <span className="text-gray-700 font-medium">Analyzing document...</span>
                        <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-gray-50 p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about this document..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                    disabled={loading}
                    maxLength={1000}
                  />
                  <div className="absolute right-3 top-3 text-xs text-gray-400">
                    {input.length}/1000
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 font-medium"
                >
                  <Send className="h-4 w-4" />
                  Send
                </button>
              </form>
              
              {/* Quick Actions */}
              {messages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <p className="text-xs text-gray-500 w-full mb-1">Quick actions:</p>
                  {["Summarize this conversation", "What are the main points?", "Any action items?"].map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(action)}
                      className="text-xs px-3 py-1 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Hidden when minimized */}
          {!isMinimized && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Document Info</h3>
              <div className="bg-white rounded-lg p-3 mb-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {document.originalName}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Size: {((document.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                  <p>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>

              <h4 className="font-medium text-gray-900 mb-3">More Questions</h4>
              <div className="space-y-2">
                {suggestedQuestions.slice(6).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left text-xs p-2 bg-white hover:bg-blue-50 border rounded-md transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 