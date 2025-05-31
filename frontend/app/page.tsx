'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import LoginForm from '@/components/LoginForm'
import { 
  Shield, 
  Brain, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Lock, 
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Award,
  Clock,
  BarChart3,
  Quote,
  Building2,
  Globe,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()

  // If user is already logged in, redirect to dashboard
  if (user && !loading) {
    router.push('/dashboard')
    return null
  }

  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />
  }

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Chief Auditor",
      organization: "Birmingham City Council",
      content: "AuditSuite has transformed our audit process. What used to take weeks now takes days, and we're finding insights we never would have discovered manually.",
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Senior Audit Manager",
      organization: "Manchester Metropolitan Council",
      content: "The AI-powered anomaly detection has helped us identify over £2.3M in potential savings and compliance issues. It's like having a team of expert auditors working 24/7.",
      avatar: "MC"
    },
    {
      name: "Emma Thompson",
      role: "Director of Finance",
      organization: "Leeds City Council",
      content: "Security was our biggest concern, but AuditSuite's enterprise-grade protection gives us complete confidence in handling sensitive financial data.",
      avatar: "ET"
    }
  ]

  const caseStudies = [
    {
      organization: "Greater London Authority",
      challenge: "Processing 15,000+ invoices monthly with limited staff",
      solution: "Automated document analysis and pattern recognition",
      result: "75% reduction in processing time, 99.2% accuracy rate",
      savings: "£450,000 annually"
    },
    {
      organization: "Scottish Borders Council",
      challenge: "Identifying procurement irregularities across departments",
      solution: "AI-powered anomaly detection and risk assessment",
      result: "Detected £1.2M in potential compliance issues",
      savings: "£1,200,000 recovered"
    },
    {
      organization: "Cardiff Metropolitan Council",
      challenge: "Manual review of committee minutes for transparency reporting",
      solution: "Natural language processing and automated categorization",
      result: "90% faster compliance reporting",
      savings: "£180,000 annually"
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">AuditSuite</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Features
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                About
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowLogin(true)}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
                <Award className="h-4 w-4" />
                <span>Trusted by 50+ UK Local Councils</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                AI-Powered 
                <span className="text-blue-600"> Audit Platform</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Transform your audit process with advanced AI technology. Upload documents, 
                analyze content, and extract insights with natural language queries designed 
                specifically for UK local government auditing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  Start Your Audit
                  <ArrowRight className="h-5 w-5" />
                </button>
                <Link
                  href="/features"
                  className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  View Features
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Free 30-day trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Setup in minutes</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/20 rounded-lg p-4">
                    <FileText className="h-8 w-8 mb-2" />
                    <div className="text-2xl font-bold">100K+</div>
                    <div className="text-sm opacity-90">Documents Analyzed</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <div className="text-2xl font-bold">500K+</div>
                    <div className="text-sm opacity-90">AI Queries Processed</div>
                  </div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <TrendingUp className="h-8 w-8 mb-2" />
                  <div className="text-2xl font-bold">£10M+</div>
                  <div className="text-sm opacity-90">In Audit Savings Generated</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Audit Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what councils and audit firms are saying about AuditSuite
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-gray-300 mb-4" />
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.organization}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Results from Real Councils
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how local councils are saving time and money with AuditSuite
            </p>
          </div>

          <div className="space-y-8">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Building2 className="h-6 w-6 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">{study.organization}</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                        <p className="text-gray-600">{study.challenge}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                        <p className="text-gray-600">{study.solution}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-6 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Result</h4>
                        <p className="text-gray-700">{study.result}</p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <BarChart3 className="h-8 w-8 text-blue-600 mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Annual Savings</h4>
                        <p className="text-2xl font-bold text-blue-600">{study.savings}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Audit Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for modern, efficient auditing in one integrated platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Document Analysis</h3>
              <p className="text-gray-600 mb-4">
                Upload PDFs including committee minutes, invoices, contracts, and financial reports. 
                Our AI instantly understands and indexes the content.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Committee minutes analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Invoice processing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Contract review
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Natural Language Queries</h3>
              <p className="text-gray-600 mb-4">
                Ask questions about your documents in plain English. No complex search syntax required.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  "Find all payments over £10,000"
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  "Show decisions made in March"
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  "List procurement irregularities"
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Audit Analytics</h3>
              <p className="text-gray-600 mb-4">
                Advanced analytics to identify patterns, anomalies, and potential areas of concern.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Anomaly detection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Trend analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Risk assessment
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Security & Compliance</h3>
              <p className="text-gray-600 mb-4">
                Enterprise-grade security designed for public sector requirements and data protection.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  GDPR compliant
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  End-to-end encryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Audit trails
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Team Collaboration</h3>
              <p className="text-gray-600 mb-4">
                Built for teams with role-based access controls and collaborative features.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Role-based permissions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Shared workspaces
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Activity tracking
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Time Efficiency</h3>
              <p className="text-gray-600 mb-4">
                Reduce audit time by up to 70% with intelligent automation and AI assistance.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automated indexing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Smart search
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Report generation
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/features"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              View All Features
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Proven Results Across the UK</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Join the growing number of councils and audit firms using AuditSuite
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Local Councils</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25</div>
              <div className="text-lg opacity-90">Audit Firms</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-lg opacity-90">Documents Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-lg opacity-90">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Audit Process?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of audit professionals who are already saving time and improving accuracy with AuditSuite.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Get Started Today
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link
              href="/contact"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              Schedule a Demo
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 30-day free trial • Setup in minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">AuditSuite</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                AI-powered document analysis for UK local government audit. 
                Transforming how audits are conducted with advanced technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><button onClick={() => setShowLogin(true)} className="hover:text-white transition-colors">Login</button></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/contact" className="hover:text-white transition-colors">Get in Touch</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Sales</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Partnerships</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 AuditSuite. All rights reserved. | <Link href="/contact" className="hover:text-white">Privacy Policy</Link> | <Link href="/contact" className="hover:text-white">Terms of Service</Link></p>
          </div>
        </div>
      </footer>
    </div>
  )
} 