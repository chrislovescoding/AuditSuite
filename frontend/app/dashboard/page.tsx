'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import LoginForm from '@/components/LoginForm'
import Header from '@/components/Header'
import DocumentUpload from '@/components/DocumentUpload'
import DocumentList from '@/components/DocumentList'
import DocumentScanner from '@/components/DocumentScanner'
import UserManagement from '@/components/UserManagement'
import { 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Loader2, 
  Users, 
  Home as HomeIcon,
  Calculator,
  Shield,
  PieChart,
  Search,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Database
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type TabType = 'dashboard' | 'users'
type AppType = 'document-chat' | 'document-scanner' | 'risk-assessment' | 'financial-analysis' | 'compliance-tracker' | 'audit-planner' | 'invoice-analyzer' | 'contract-reviewer' | 'fraud-detection'

export default function Dashboard() {
  const { user, permissions, loading, token } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [selectedApp, setSelectedApp] = useState<AppType | null>(null)
  const [stats, setStats] = useState({
    totalDocuments: 0,
    documentsThisMonth: 0,
    activeChats: 0,
    issuesFound: 0
  })
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return
      
      try {
        const response = await fetch('/api/documents', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const documents = await response.json()
          const thisMonth = new Date()
          thisMonth.setDate(1)
          thisMonth.setHours(0, 0, 0, 0)
          
          const documentsThisMonth = documents.filter((doc: any) => 
            new Date(doc.uploadDate) >= thisMonth
          ).length
          
          setStats({
            totalDocuments: documents.length,
            documentsThisMonth,
            activeChats: documents.length, // Simplified for demo
            issuesFound: Math.floor(documents.length * 0.3) // Demo calculation
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    fetchStats()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard',
      icon: HomeIcon,
      description: 'Audit applications and overview',
    },
  ]

  // Add user management tab for admins
  if (permissions?.canManageUsers) {
    tabs.push({
      id: 'users' as TabType,
      label: 'User Management',
      icon: Users,
      description: 'Manage users, roles, and permissions',
    })
  }

  const auditApplications = [
    {
      id: 'document-chat' as AppType,
      title: 'Document Chat',
      description: 'Full-screen AI chat interface for in-depth document analysis',
      icon: MessageSquare,
      color: 'bg-blue-500',
      available: true,
      category: 'Analysis'
    },
    {
      id: 'document-scanner' as AppType,
      title: 'Document Scanner',
      description: 'Upload PDFs and scan for specific topics with intelligent highlighting',
      icon: Search,
      color: 'bg-cyan-500',
      available: true,
      category: 'Analysis'
    },
    {
      id: 'financial-analysis' as AppType,
      title: 'Financial Analysis',
      description: 'Automated financial statement review and risk assessment',
      icon: Calculator,
      color: 'bg-green-500',
      available: false,
      category: 'Finance'
    },
    {
      id: 'risk-assessment' as AppType,
      title: 'Risk Assessment',
      description: 'Identify and assess audit risks with AI assistance',
      icon: Shield,
      color: 'bg-orange-500',
      available: false,
      category: 'Risk'
    },
    {
      id: 'compliance-tracker' as AppType,
      title: 'Compliance Tracker',
      description: 'Monitor regulatory compliance and track requirements',
      icon: CheckSquare,
      color: 'bg-purple-500',
      available: false,
      category: 'Compliance'
    },
    {
      id: 'fraud-detection' as AppType,
      title: 'Fraud Detection',
      description: 'AI-powered fraud pattern analysis and anomaly detection',
      icon: AlertTriangle,
      color: 'bg-red-500',
      available: false,
      category: 'Security'
    },
    {
      id: 'audit-planner' as AppType,
      title: 'Audit Planner',
      description: 'Plan and schedule audit activities with timeline management',
      icon: Calendar,
      color: 'bg-indigo-500',
      available: false,
      category: 'Planning'
    },
    {
      id: 'invoice-analyzer' as AppType,
      title: 'Invoice Analyzer',
      description: 'Automated invoice processing, validation and approval workflows',
      icon: Database,
      color: 'bg-teal-500',
      available: false,
      category: 'Finance'
    },
    {
      id: 'contract-reviewer' as AppType,
      title: 'Contract Reviewer',
      description: 'AI contract analysis with risk identification and clause review',
      icon: Search,
      color: 'bg-pink-500',
      available: false,
      category: 'Legal'
    }
  ]

  const handleAppClick = (app: typeof auditApplications[0]) => {
    if (!app.available) {
      return // Show coming soon message or do nothing
    }
    setSelectedApp(app.id)
  }

  const handleBackToApps = () => {
    setSelectedApp(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.firstName}!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            AI-powered audit suite for UK local government. 
            Access comprehensive tools for document analysis, risk assessment, and compliance monitoring.
          </p>
        </div>

        {/* Navigation Tabs */}
        {tabs.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
            
            {/* Active Tab Description */}
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* If an app is selected, show its interface */}
            {selectedApp === 'document-chat' ? (
              <div className="space-y-6">
                {/* App Header */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={handleBackToApps}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border transition-colors"
                  >
                    ← Back to Apps
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Document Chat</h2>
                    <p className="text-gray-600">AI-powered document analysis and Q&A</p>
                  </div>
                </div>

                {/* Document Chat Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Upload Section */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-xl font-semibold mb-4">Upload Document</h3>
                    <DocumentUpload />
                  </div>

                  {/* Documents List */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-xl font-semibold mb-4">Your Documents</h3>
                    <DocumentList />
                  </div>
                </div>
              </div>
            ) : selectedApp === 'document-scanner' ? (
              <div className="space-y-6">
                {/* App Header */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={handleBackToApps}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border transition-colors"
                  >
                    ← Back to Apps
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Document Scanner</h2>
                    <p className="text-gray-600">Upload PDFs and scan for specific topics with intelligent highlighting</p>
                  </div>
                </div>

                {/* Document Scanner Interface */}
                <DocumentScanner />
              </div>
            ) : (
              <>
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Documents</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">This Month</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.documentsThisMonth}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Chats</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeChats}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Issues Found</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.issuesFound}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Applications Grid */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Audit Applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {auditApplications.map((app) => {
                      const IconComponent = app.icon
                      return (
                        <div
                          key={app.id}
                          onClick={() => handleAppClick(app)}
                          className={`
                            relative bg-white rounded-xl border shadow-sm p-6 transition-all duration-200 
                            ${app.available 
                              ? 'hover:shadow-md hover:-translate-y-1 cursor-pointer hover:border-gray-300' 
                              : 'opacity-75 cursor-not-allowed'
                            }
                          `}
                        >
                          {!app.available && (
                            <div className="absolute top-3 right-3 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                              Coming Soon
                            </div>
                          )}
                          
                          <div className="flex items-start gap-4">
                            <div className={`p-3 ${app.color} rounded-lg flex-shrink-0`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1">{app.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{app.description}</p>
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {app.category}
                              </span>
                            </div>
                          </div>
                          
                          {app.available && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center text-blue-600 text-sm font-medium">
                                Launch App
                                <span className="ml-2">→</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setSelectedApp('document-chat')}
                      className="flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg border transition-colors"
                    >
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Upload Document</p>
                        <p className="text-sm text-gray-600">Start analyzing a new document</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setSelectedApp('document-scanner')}
                      className="flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg border transition-colors"
                    >
                      <Search className="h-5 w-5 text-cyan-600" />
                      <div>
                        <p className="font-medium text-gray-900">Scan Document</p>
                        <p className="text-sm text-gray-600">Find specific topics in PDFs</p>
                      </div>
                    </button>
                    
                    <button className="flex items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-lg border transition-colors opacity-50 cursor-not-allowed">
                      <PieChart className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Generate Report</p>
                        <p className="text-sm text-gray-600">Create audit summary (Coming Soon)</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === 'users' && permissions?.canManageUsers && (
          <UserManagement />
        )}
      </main>
    </div>
  )
} 