'use client'

import Link from 'next/link'
import { Shield, ArrowLeft, Users, Award, Globe, Zap } from 'lucide-react'

export default function About() {
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
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About AuditSuite
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're revolutionizing the way UK local government conducts audits through 
              advanced AI technology, making the process more efficient, accurate, and accessible.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6">
                  To empower UK local government auditors with cutting-edge AI technology 
                  that transforms traditional document analysis into an intelligent, 
                  efficient, and comprehensive audit process.
                </p>
                <p className="text-lg text-gray-600">
                  We believe that every council deserves access to world-class audit tools 
                  that help ensure transparency, accountability, and proper stewardship of public funds.
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Impact</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6" />
                    <span>500+ Audit Professionals Served</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-6 w-6" />
                    <span>50+ Local Councils Protected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-6 w-6" />
                    <span>£50M+ in Public Funds Audited</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6" />
                    <span>70% Reduction in Audit Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-xl text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Security First</h3>
                <p className="text-gray-600">
                  We prioritize the security and confidentiality of sensitive government data 
                  with enterprise-grade protection and compliance standards.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Public Service</h3>
                <p className="text-gray-600">
                  We're committed to serving the public interest by helping ensure 
                  transparency and accountability in local government operations.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
                <p className="text-gray-600">
                  We continuously push the boundaries of what's possible with AI 
                  to make auditing more effective and accessible.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
            </div>

            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                AuditSuite was born from a simple observation: local government auditors 
                were spending countless hours manually reviewing documents that could be 
                analyzed far more efficiently with modern AI technology.
              </p>
              <p>
                Founded in 2023 by a team of former government auditors and AI researchers, 
                we set out to create a platform specifically designed for the unique needs 
                of UK local government audit processes.
              </p>
              <p>
                Working closely with councils across England, Scotland, and Wales, we've 
                developed a solution that not only saves time but actually improves the 
                quality and thoroughness of audits through intelligent pattern recognition 
                and anomaly detection.
              </p>
              <p>
                Today, AuditSuite is trusted by dozens of local councils and audit firms 
                to help ensure the proper stewardship of public funds and maintain the 
                highest standards of public accountability.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Audit Process?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join the growing community of audit professionals using AuditSuite.
            </p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              Get Started Today
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
} 