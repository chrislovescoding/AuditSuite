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
  Database,
  ArrowLeft
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
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100')`,
          fontFamily: 'Times New Roman, serif'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-white mb-4" />
          <p className="text-white/90 text-lg">Loading your portal...</p>
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
      description: 'Strategic advisory applications and overview',
    },
  ]

  const auditApplications = [
    {
      id: 'document-chat' as AppType,
      title: 'Document Analysis',
      description: 'AI-powered document analysis with strategic insights and recommendations',
      icon: MessageSquare,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
      available: true,
      category: 'Analysis'
    },
    {
      id: 'document-scanner' as AppType,
      title: 'Topic Scanner',
      description: 'Intelligent document scanning for specific topics and strategic themes',
      icon: Search,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
      available: true,
      category: 'Research'
    },
    {
      id: 'financial-analysis' as AppType,
      title: 'Financial Analysis',
      description: 'Strategic financial review and performance assessment',
      icon: Calculator,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
      available: false,
      category: 'Finance'
    },
    {
      id: 'risk-assessment' as AppType,
      title: 'Risk Assessment',
      description: 'Comprehensive risk analysis and mitigation strategies',
      icon: Shield,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
      available: false,
      category: 'Risk'
    },
    {
      id: 'compliance-tracker' as AppType,
      title: 'Compliance Review',
      description: 'Regulatory compliance monitoring and strategic recommendations',
      icon: CheckSquare,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
      available: false,
      category: 'Compliance'
    },
    {
      id: 'fraud-detection' as AppType,
      title: 'Strategic Intelligence',
      description: 'Pattern analysis and strategic intelligence for decision-making',
      icon: AlertTriangle,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
      available: false,
      category: 'Intelligence'
    },
    {
      id: 'audit-planner' as AppType,
      title: 'Strategic Planner',
      description: 'Strategic planning and project timeline management',
      icon: Calendar,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
      available: false,
      category: 'Planning'
    },
    {
      id: 'invoice-analyzer' as AppType,
      title: 'Financial Processor',
      description: 'Automated financial document processing and validation',
      icon: Database,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
      available: false,
      category: 'Finance'
    },
    {
      id: 'contract-reviewer' as AppType,
      title: 'Contract Advisor',
      description: 'Strategic contract analysis with risk identification and recommendations',
      icon: Search,
      color: 'bg-white/20 backdrop-blur-sm border-white/30',
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
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative dashboard-container"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100')`,
        fontFamily: 'Times New Roman, serif'
      }}
    >
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">
              <h2 className="text-4xl font-light text-white italic">
                Welcome back, {user.firstName}
              </h2>
            </div>
          </div>

          {/* Dashboard Content */}
          {/* If an app is selected, show its interface */}
          {selectedApp === 'document-chat' ? (
            <div className="space-y-6">
              {/* App Header */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={handleBackToApps}
                    className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg border border-white/20 transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Applications
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-light text-white mb-2 italic">Document Analysis</h2>
                  <p className="text-white/80">AI-powered strategic document analysis and advisory insights</p>
                </div>
              </div>

              {/* Document Chat Interface */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">
                  <h3 className="text-xl font-semibold text-white mb-6">Upload Document</h3>
                  <DocumentUpload />
                </div>

                {/* Documents List */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">
                  <h3 className="text-xl font-semibold text-white mb-6">Your Documents</h3>
                  <DocumentList />
                </div>
              </div>
            </div>
          ) : selectedApp === 'document-scanner' ? (
            <div className="space-y-6">
              {/* App Header */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={handleBackToApps}
                    className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg border border-white/20 transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Applications
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-light text-white mb-2 italic">Topic Scanner</h2>
                  <p className="text-white/80">Intelligent document scanning for strategic themes and insights</p>
                </div>
              </div>

              {/* Document Scanner Interface */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">
                <DocumentScanner />
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Total Documents</p>
                      <p className="text-3xl font-light text-white">{stats.totalDocuments}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">This Month</p>
                      <p className="text-3xl font-light text-white">{stats.documentsThisMonth}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Active Sessions</p>
                      <p className="text-3xl font-light text-white">{stats.activeChats}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/80">Insights Generated</p>
                      <p className="text-3xl font-light text-white">{stats.issuesFound}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategic Applications Grid */}
              <div className="mb-8">
                <h3 className="text-3xl font-light text-white mb-8 italic">Strategic Advisory Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auditApplications.map((app) => {
                    const IconComponent = app.icon
                    return (
                      <div
                        key={app.id}
                        onClick={() => handleAppClick(app)}
                        className={`
                          relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl transition-all duration-300 
                          ${app.available 
                            ? 'hover:bg-white/20 hover:-translate-y-1 cursor-pointer hover:border-white/40' 
                            : 'opacity-60 cursor-not-allowed'
                          }
                        `}
                        style={{ border: '2px solid rgba(255, 255, 255, 0.2)' }}
                      >
                        {!app.available && (
                          <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-200 text-xs font-medium px-3 py-1 rounded-full border border-yellow-300/30 backdrop-blur-sm">
                            Coming Soon
                          </div>
                        )}
                        
                        <div className="flex items-start gap-4">
                          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0 border border-white/30">
                            <IconComponent className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white mb-2 text-lg">{app.title}</h4>
                            <p className="text-sm text-white/80 mb-3 leading-relaxed">{app.description}</p>
                            <span className="inline-block px-3 py-1 bg-white/20 text-white/80 text-xs rounded-full border border-white/30">
                              {app.category}
                            </span>
                          </div>
                        </div>
                        
                        {app.available && (
                          <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex items-center text-white text-sm font-medium">
                              Launch Application
                              <span className="ml-2">→</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
} 