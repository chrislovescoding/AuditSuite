'use client'

import Link from 'next/link'
import { ArrowLeft, Users, Award, Globe, Zap, Mail, Phone, MapPin } from 'lucide-react'

export default function About() {
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
              <Link href="/about" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors border-b-2 border-[#173559]">
                Case Studies
              </Link>
              <Link href="/about" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors">
                About
              </Link>
              <Link href="/contact" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors">
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
                About <span className="font-bold">Blackwood Analytics</span>
              </h1>
              <p className="text-xl text-white/90 font-light leading-relaxed">
                We're a family-run advisory firm delivering high-impact strategic insights, 
                financial clarity, and bespoke research — all aligned to your vision.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-[#EDE5D4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-light text-[#173559] mb-6 italic">
                  Our Mission
                </h2>
                <p className="text-lg text-[#494B4F] mb-6 leading-relaxed">
                  To empower UK public sector organizations with cutting-edge analytical 
                  insights that transform decision-making processes and drive meaningful outcomes.
                </p>
                <p className="text-lg text-[#494B4F] leading-relaxed">
                  We believe that every public body deserves access to world-class strategic 
                  advisory services that help ensure transparency, accountability, and effective 
                  stewardship of public resources.
                </p>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#173559] rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#173559]">Strategic Advisory</h3>
                      <p className="text-[#494B4F] text-sm">Expert guidance for complex decisions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#173559] rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#173559]">Financial Clarity</h3>
                      <p className="text-[#494B4F] text-sm">Clear insights into financial performance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#173559] rounded-full flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#173559]">Bespoke Research</h3>
                      <p className="text-[#494B4F] text-sm">Tailored analysis for your specific needs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-[#173559]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-white mb-4">Our Values</h2>
              <p className="text-xl text-white/80">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Excellence</h3>
                <p className="text-white/80">
                  We strive for the highest standards in everything we deliver, 
                  ensuring quality and precision in our analytical work.
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Collaboration</h3>
                <p className="text-white/80">
                  We work closely with our clients as trusted partners, 
                  understanding their unique challenges and objectives.
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Impact</h3>
                <p className="text-white/80">
                  We focus on delivering actionable insights that drive 
                  real change and meaningful outcomes for our clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-[#EDE5D4]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="h-64 bg-gradient-to-br from-[#173559] to-[#494B4F] rounded-lg"></div>
              </div>
              
              <div>
                <h2 className="text-4xl font-light text-[#173559] mb-6 italic">Our Story</h2>
                
                <div className="space-y-6 text-[#494B4F]">
                  <p className="leading-relaxed">
                    Blackwood Analytics was founded on a simple belief: that the public sector 
                    deserves the same calibre of strategic advisory services available to the 
                    private sector.
                  </p>
                  <p className="leading-relaxed">
                    Our team brings together decades of experience from strategy consulting, 
                    investment banking, government, and defense sectors. This unique blend 
                    of perspectives allows us to understand both the analytical rigor required 
                    and the practical realities of public sector decision-making.
                  </p>
                  <p className="leading-relaxed">
                    Working across England, Scotland, and Wales, we've developed deep expertise 
                    in the challenges facing public bodies today. From budget constraints to 
                    regulatory compliance, from stakeholder management to performance optimization, 
                    we understand what keeps public sector leaders awake at night.
                  </p>
                  <p className="leading-relaxed">
                    Today, Blackwood Analytics is trusted by government departments, local 
                    authorities, and public agencies to provide the clarity and strategic 
                    direction needed to navigate an increasingly complex landscape.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-[#173559]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-white mb-4">
                Leadership Team
              </h2>
              <p className="text-xl text-white/80">
                Meet the experts behind Blackwood Analytics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[#494B4F] to-[#173559]"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">[Founder Name]</h3>
                <p className="text-white/80 mb-4">Founder & Principal</p>
                <p className="text-white/70 text-sm">
                  Former strategy consultant with 15+ years experience in public sector transformation.
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-[#494B4F] to-[#173559]"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">[Partner Name]</h3>
                <p className="text-white/80 mb-4">Senior Partner</p>
                <p className="text-white/70 text-sm">
                  Former investment banker specializing in public finance and infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#EDE5D4]">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-light text-[#173559] mb-6 italic">
              Ready to work together?
            </h2>
            <p className="text-xl text-[#494B4F] mb-8 leading-relaxed">
              Let's discuss how Blackwood Analytics can help your organization 
              achieve its strategic objectives.
            </p>
            <Link
              href="/contact"
              className="bg-[#173559] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#494B4F] transition-colors inline-flex items-center gap-2"
            >
              Get in Touch
            </Link>
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