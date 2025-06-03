'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#EDE5D4]">
        {/* Navigation */}
        <nav className="fixed w-full top-0 bg-white/10 backdrop-blur-md border-b border-white/20 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#173559] rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
                </div>
                <span className="text-xl font-bold text-[#173559] tracking-wide">BLACKWOOD<br />ANALYTICS</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 text-[#173559] hover:text-[#494B4F] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </nav>

        <div className="pt-16 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="bg-[#173559] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-light text-[#173559] mb-4">Message Sent Successfully!</h1>
              <p className="text-lg text-[#494B4F] mb-8">
                Thank you for your interest in Blackwood Analytics. Our team will review your message and get back to you within 24 hours.
              </p>
              <Link
                href="/"
                className="bg-[#173559] text-white px-6 py-3 rounded-md font-medium hover:bg-[#494B4F] transition-colors inline-flex items-center gap-2"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EDE5D4]">
      {/* Navigation */}
      <nav className="fixed w-full top-0 bg-white/10 backdrop-blur-md border-b border-white/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#173559] rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
              </div>
              <span className="text-xl font-bold text-[#173559] tracking-wide">BLACKWOOD<br />ANALYTICS</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/features" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors">
                Services
              </Link>
              <Link href="/about" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors">
                Case Studies
              </Link>
              <Link href="/about" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors border-b-2 border-[#173559]">
                Contact
              </Link>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 text-[#173559] hover:text-[#494B4F] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-32 bg-cover bg-center" 
                 style={{
                   backgroundImage: `linear-gradient(rgba(23, 53, 89, 0.8), rgba(23, 53, 89, 0.8)), url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect fill="%23494B4F" width="1200" height="800"/></svg>')`
                 }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(30deg, transparent 30%, rgba(255,255,255,0.05) 31%, rgba(255,255,255,0.05) 32%, transparent 33%),
                linear-gradient(-30deg, transparent 30%, rgba(255,255,255,0.05) 31%, rgba(255,255,255,0.05) 32%, transparent 33%)
              `,
              backgroundSize: '15px 15px'
            }}></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-lg p-8">
              <h1 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight">
                Get in <span className="font-bold">Touch</span>
              </h1>
              <p className="text-xl text-white/90 font-light leading-relaxed">
                Ready to transform your strategic approach? We're here to help you 
                achieve clarity and drive meaningful results.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-20 bg-[#EDE5D4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Information */}
              <div>
                <h2 className="text-4xl font-light text-[#173559] mb-8 italic">Contact Information</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-6">
                    <div className="bg-[#173559] w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#173559] mb-2 text-xl">Email Us</h3>
                      <p className="text-[#494B4F] mb-3 leading-relaxed">
                        For general inquiries and strategic consultation
                      </p>
                      <a href="mailto:info@blackwoodanalytics.com" className="text-[#173559] hover:text-[#494B4F] font-medium transition-colors">
                        info@blackwoodanalytics.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="bg-[#173559] w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#173559] mb-2 text-xl">Call Us</h3>
                      <p className="text-[#494B4F] mb-3 leading-relaxed">
                        Speak directly with our advisory team
                      </p>
                      <a href="tel:+441344622896" className="text-[#173559] hover:text-[#494B4F] font-medium transition-colors">
                        01344 622896
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="bg-[#173559] w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#173559] mb-2 text-xl">Visit Us</h3>
                      <p className="text-[#494B4F] mb-3 leading-relaxed">
                        Our offices in Berkshire
                      </p>
                      <address className="text-[#494B4F] not-italic leading-relaxed">
                        25 Matthews Court<br />
                        Ascot, Berkshire<br />
                        SL5 7RE
                      </address>
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="bg-[#173559] w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#173559] mb-2 text-xl">Business Hours</h3>
                      <p className="text-[#494B4F] mb-3 leading-relaxed">
                        When our team is available
                      </p>
                      <div className="text-[#494B4F]">
                        <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                        <div>Saturday - Sunday: By appointment</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Contact Methods */}
                <div className="mt-12 p-8 bg-white rounded-lg shadow-lg">
                  <h3 className="font-semibold text-[#173559] mb-6 text-xl">Ready to Start a Conversation?</h3>
                  <div className="space-y-4 text-[#494B4F]">
                    <div>
                      <strong>Strategic Consulting:</strong> info@blackwoodanalytics.com
                    </div>
                    <div>
                      <strong>Partnership Opportunities:</strong> partnerships@blackwoodanalytics.com
                    </div>
                    <div>
                      <strong>Media Inquiries:</strong> media@blackwoodanalytics.com
                    </div>
                    <div className="pt-4 border-t border-[#173559]/20">
                      <p className="text-sm text-[#494B4F]">
                        All inquiries are treated with strict confidentiality and will receive a response within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-3xl font-light text-[#173559] mb-8 italic">Send us a Message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-[#173559] font-medium mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-[#173559]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#173559] focus:border-transparent"
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-[#173559] font-medium mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-[#173559]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#173559] focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="organization" className="block text-[#173559] font-medium mb-2">
                          Organization
                        </label>
                        <input
                          type="text"
                          id="organization"
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-[#173559]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#173559] focus:border-transparent"
                          placeholder="Your organization"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-[#173559] font-medium mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-[#173559]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#173559] focus:border-transparent"
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-[#173559] font-medium mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#173559]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#173559] focus:border-transparent"
                      >
                        <option value="">Select a subject</option>
                        <option value="strategic-consulting">Strategic Consulting</option>
                        <option value="financial-analysis">Financial Analysis</option>
                        <option value="stakeholder-research">Stakeholder Research</option>
                        <option value="benchmarking">Peer Benchmarking</option>
                        <option value="general">General Inquiry</option>
                        <option value="partnership">Partnership Opportunity</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-[#173559] font-medium mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[#173559]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#173559] focus:border-transparent resize-vertical"
                        placeholder="Tell us about your project, challenges, or how we can help..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#173559] text-white px-8 py-4 rounded-md font-medium hover:bg-[#494B4F] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Message
                          <Send className="h-5 w-5" />
                        </>
                      )}
                    </button>

                    <p className="text-sm text-[#494B4F] text-center">
                      By submitting this form, you agree to our privacy policy and terms of service. 
                      We'll respond within 24 hours.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#EDE5D4] py-12 border-t border-[#173559]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#173559] rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full opacity-80"></div>
                </div>
                <span className="text-lg font-bold text-[#173559] tracking-wide">BLACKWOOD<br />ANALYTICS</span>
              </div>
              <p className="text-[#494B4F] text-sm mb-4">
                Strategic insights, financial clarity, and bespoke research 
                to help UK government bodies make better decisions.
              </p>
            </div>

            {/* Hours */}
            <div>
              <h3 className="text-[#173559] font-semibold mb-4">Hours</h3>
              <div className="text-[#494B4F] text-sm space-y-1">
                <p>Monday – Friday</p>
                <p>9am – 6pm</p>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-[#173559] font-semibold mb-4">Contact</h3>
              <div className="text-[#494B4F] text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>info@blackwoodanalytics.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>01344 622896</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1" />
                  <div>
                    <p>25 Matthews Court</p>
                    <p>Ascot, Berkshire SL5 7RE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#173559]/20 mt-8 pt-8 text-center">
            <p className="text-[#494B4F] text-sm">
              &copy; 2024 Blackwood Analytics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 