'use client'

import Link from 'next/link'
import { 
  Shield, 
  ArrowLeft, 
  Brain, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Lock, 
  Users, 
  Clock, 
  CheckCircle,
  Search,
  Download,
  BarChart3,
  AlertTriangle,
  Database,
  Cloud
} from 'lucide-react'

export default function Features() {
  const features = [
    {
      category: "AI-Powered Analysis",
      items: [
        {
          icon: Brain,
          title: "Intelligent Document Processing",
          description: "Advanced AI algorithms automatically extract and categorize key information from PDFs, including committee minutes, financial reports, and contracts.",
          benefits: [
            "Automatic text extraction and OCR",
            "Smart categorization by document type",
            "Metadata extraction and indexing",
            "Multi-language support"
          ]
        },
        {
          icon: MessageSquare,
          title: "Natural Language Queries",
          description: "Ask questions about your documents in plain English and get precise, contextual answers instantly.",
          benefits: [
            "Conversational AI interface",
            "Context-aware responses",
            "Citation and source tracking",
            "Multi-document analysis"
          ]
        },
        {
          icon: TrendingUp,
          title: "Anomaly Detection",
          description: "Automatically identify unusual patterns, discrepancies, and potential areas of concern across your document corpus.",
          benefits: [
            "Financial irregularity detection",
            "Pattern recognition across documents",
            "Risk scoring and prioritization",
            "Automated alert generation"
          ]
        }
      ]
    },
    {
      category: "Document Management",
      items: [
        {
          icon: FileText,
          title: "Secure Document Storage",
          description: "Enterprise-grade storage with advanced security features designed for sensitive government documents.",
          benefits: [
            "End-to-end encryption",
            "Version control and history",
            "Automated backups",
            "GDPR compliant storage"
          ]
        },
        {
          icon: Search,
          title: "Advanced Search",
          description: "Powerful search capabilities that go beyond keywords to understand context and meaning.",
          benefits: [
            "Semantic search technology",
            "Filter by date, type, and content",
            "Saved search queries",
            "Bulk operations"
          ]
        },
        {
          icon: Download,
          title: "Export & Reporting",
          description: "Generate comprehensive reports and export data in multiple formats for external use.",
          benefits: [
            "Multiple export formats (PDF, Excel, CSV)",
            "Custom report templates",
            "Automated report generation",
            "Executive summary creation"
          ]
        }
      ]
    },
    {
      category: "Security & Compliance",
      items: [
        {
          icon: Lock,
          title: "Enterprise Security",
          description: "Military-grade security measures to protect sensitive government data and ensure compliance.",
          benefits: [
            "256-bit AES encryption",
            "Multi-factor authentication",
            "IP restriction controls",
            "Regular security audits"
          ]
        },
        {
          icon: Shield,
          title: "Compliance Management",
          description: "Built-in compliance features for UK government standards and data protection regulations.",
          benefits: [
            "GDPR compliance tools",
            "Audit trail generation",
            "Data retention policies",
            "Regulatory reporting"
          ]
        },
        {
          icon: Users,
          title: "Access Control",
          description: "Granular permission system to ensure only authorized personnel can access sensitive information.",
          benefits: [
            "Role-based permissions",
            "Department-level access",
            "Activity monitoring",
            "User session management"
          ]
        }
      ]
    },
    {
      category: "Analytics & Insights",
      items: [
        {
          icon: BarChart3,
          title: "Performance Analytics",
          description: "Comprehensive analytics dashboard to track audit progress and identify trends.",
          benefits: [
            "Real-time dashboard updates",
            "Custom metric tracking",
            "Performance benchmarking",
            "Historical trend analysis"
          ]
        },
        {
          icon: AlertTriangle,
          title: "Risk Assessment",
          description: "Automated risk scoring and assessment tools to prioritize audit efforts.",
          benefits: [
            "AI-powered risk scoring",
            "Customizable risk parameters",
            "Risk trend monitoring",
            "Automated escalation rules"
          ]
        },
        {
          icon: Clock,
          title: "Time Tracking",
          description: "Built-in time tracking and productivity monitoring to optimize audit processes.",
          benefits: [
            "Automatic time logging",
            "Project milestone tracking",
            "Resource allocation insights",
            "Efficiency reporting"
          ]
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">AuditSuite</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Powerful Features for Modern Auditing
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover how AuditSuite's comprehensive feature set transforms traditional 
              audit processes into efficient, AI-powered workflows.
            </p>
          </div>
        </section>

        {/* Features by Category */}
        {features.map((category, categoryIndex) => (
          <section key={category.category} className={`py-16 ${categoryIndex % 2 === 1 ? 'bg-gray-50' : ''}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{category.category}</h2>
              </div>

              <div className="space-y-16">
                {category.items.map((feature, index) => {
                  const IconComponent = feature.icon
                  return (
                    <div key={index} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                      <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                        </div>
                        <p className="text-lg text-gray-600 mb-6">
                          {feature.description}
                        </p>
                        <ul className="space-y-3">
                          {feature.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm opacity-75">Feature Highlight</span>
                              <IconComponent className="h-8 w-8" />
                            </div>
                            <h4 className="text-xl font-semibold">{feature.title}</h4>
                            <div className="space-y-2 text-sm opacity-90">
                              <div>• Saves 60-80% of manual review time</div>
                              <div>• 99.5% accuracy in pattern detection</div>
                              <div>• Seamlessly integrates with existing workflows</div>
                              <div>• 24/7 automated monitoring and alerts</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ))}

        {/* Technical Specifications */}
        <section className="py-16 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Technical Specifications</h2>
              <p className="text-xl text-gray-300">
                Built on cutting-edge technology for maximum performance and reliability
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Database className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Data Processing</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>Process up to 10,000 documents/hour</li>
                  <li>Support for 50+ file formats</li>
                  <li>Real-time indexing and search</li>
                  <li>Distributed processing architecture</li>
                </ul>
              </div>

              <div className="text-center">
                <Cloud className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Infrastructure</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>99.9% uptime SLA</li>
                  <li>Auto-scaling cloud deployment</li>
                  <li>Global CDN for fast access</li>
                  <li>Regular automated backups</li>
                </ul>
              </div>

              <div className="text-center">
                <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Security</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>SOC 2 Type II certified</li>
                  <li>ISO 27001 compliant</li>
                  <li>End-to-end encryption</li>
                  <li>Regular penetration testing</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Experience These Features Today
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              See how AuditSuite can transform your audit process with a personalized demo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                Start Free Trial
              </Link>
              <Link
                href="/contact"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 