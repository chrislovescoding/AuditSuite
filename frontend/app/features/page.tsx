'use client'

import Link from 'next/link'
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  BarChart3,
  Target,
  Lightbulb,
  Shield,
  CheckCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

export default function Services() {
  const services = [
    {
      category: "Strategic Advisory",
      description: "Expert guidance for complex strategic decisions and organizational transformation",
      items: [
        {
          icon: Target,
          title: "Strategic Planning & Vision",
          description: "Comprehensive strategic planning services to define your organization's direction and priorities.",
          benefits: [
            "Long-term strategic roadmaps",
            "Vision and mission development",
            "Stakeholder alignment strategies",
            "Performance measurement frameworks"
          ]
        },
        {
          icon: TrendingUp,
          title: "Business Case Development",
          description: "Robust business cases that provide clear justification for investment decisions and strategic initiatives.",
          benefits: [
            "Financial modeling and analysis",
            "Risk assessment and mitigation",
            "Options appraisal",
            "Investment decision support"
          ]
        },
        {
          icon: Users,
          title: "Organizational Development",
          description: "Strategic advice on organizational structure, capability building, and change management.",
          benefits: [
            "Organizational design",
            "Capability assessments",
            "Change management strategies",
            "Leadership development planning"
          ]
        }
      ]
    },
    {
      category: "Financial Analysis",
      description: "In-depth financial analysis and modeling to support critical decision-making",
      items: [
        {
          icon: BarChart3,
          title: "Financial Performance Analysis",
          description: "Comprehensive analysis of financial performance, trends, and benchmarking against peers.",
          benefits: [
            "Performance trend analysis",
            "Peer comparison studies",
            "Efficiency and productivity metrics",
            "Cost-benefit analysis"
          ]
        },
        {
          icon: Shield,
          title: "Risk & Compliance Assessment",
          description: "Detailed risk analysis and compliance reviews to ensure regulatory adherence and risk mitigation.",
          benefits: [
            "Risk register development",
            "Compliance gap analysis",
            "Control framework assessment",
            "Regulatory impact analysis"
          ]
        },
        {
          icon: Lightbulb,
          title: "Investment Appraisal",
          description: "Rigorous evaluation of investment opportunities and capital allocation decisions.",
          benefits: [
            "NPV and IRR analysis",
            "Sensitivity and scenario modeling",
            "Investment optimization",
            "Portfolio analysis"
          ]
        }
      ]
    },
    {
      category: "Research & Insights",
      description: "Bespoke research and analysis tailored to your specific needs and challenges",
      items: [
        {
          icon: Users,
          title: "Stakeholder Needs Analysis",
          description: "Comprehensive mapping and analysis of stakeholder requirements and expectations.",
          benefits: [
            "Stakeholder mapping and segmentation",
            "Needs assessment surveys",
            "Expectation management strategies",
            "Communication planning"
          ]
        },
        {
          icon: TrendingUp,
          title: "Peer Landscape & Benchmarking",
          description: "Detailed analysis of peer organizations and industry benchmarking studies.",
          benefits: [
            "Comparative performance analysis",
            "Best practice identification",
            "Market positioning studies",
            "Competitive intelligence"
          ]
        },
        {
          icon: BarChart3,
          title: "Market Research & Analysis",
          description: "In-depth market research to inform strategic decisions and opportunity identification.",
          benefits: [
            "Market sizing and segmentation",
            "Trend analysis and forecasting",
            "Customer insight research",
            "Opportunity assessment"
          ]
        }
      ]
    }
  ]

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
              <Link href="/features" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors border-b-2 border-[#173559]">
                Services
              </Link>
              <Link href="/about" className="text-[#173559] hover:text-[#494B4F] text-sm font-medium transition-colors">
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
                Our <span className="font-bold">Services</span>
              </h1>
              <p className="text-xl text-white/90 font-light leading-relaxed">
                Comprehensive strategic advisory services designed to help public sector 
                organizations navigate complex challenges and achieve their objectives.
              </p>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 bg-[#EDE5D4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-[#173559] mb-6 italic">
                Clarity. Strategy. Results.
              </h2>
              <p className="text-xl text-[#494B4F] max-w-3xl mx-auto leading-relaxed">
                We combine deep analytical expertise with practical understanding of public sector 
                decision-making to deliver insights that drive meaningful change.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="w-16 h-16 bg-[#173559] rounded-lg flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-[#173559] mb-4">Strategic Advisory</h3>
                <p className="text-[#494B4F] leading-relaxed">
                  Expert guidance on strategic planning, business case development, and 
                  organizational transformation to help you achieve your long-term objectives.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="w-16 h-16 bg-[#173559] rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-[#173559] mb-4">Financial Analysis</h3>
                <p className="text-[#494B4F] leading-relaxed">
                  Comprehensive financial modeling, performance analysis, and investment appraisal 
                  to support critical decision-making and resource allocation.
                </p>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="w-16 h-16 bg-[#173559] rounded-lg flex items-center justify-center mb-6">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-[#173559] mb-4">Research & Insights</h3>
                <p className="text-[#494B4F] leading-relaxed">
                  Bespoke research and analysis including stakeholder needs assessment, 
                  peer benchmarking, and market intelligence to inform strategic decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Services */}
        {services.map((serviceCategory, categoryIndex) => (
          <section key={categoryIndex} className={categoryIndex % 2 === 0 ? "py-20 bg-[#173559]" : "py-20 bg-[#EDE5D4]"}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className={`text-4xl font-light mb-6 italic ${categoryIndex % 2 === 0 ? 'text-white' : 'text-[#173559]'}`}>
                  {serviceCategory.category}
                </h2>
                <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${categoryIndex % 2 === 0 ? 'text-white/80' : 'text-[#494B4F]'}`}>
                  {serviceCategory.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {serviceCategory.items.map((service, serviceIndex) => (
                  <div key={serviceIndex} className={`rounded-lg p-8 shadow-lg ${categoryIndex % 2 === 0 ? 'bg-white/10 backdrop-blur-sm' : 'bg-white'}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${categoryIndex % 2 === 0 ? 'bg-white/20' : 'bg-[#173559]'}`}>
                      <service.icon className={`h-6 w-6 ${categoryIndex % 2 === 0 ? 'text-white' : 'text-white'}`} />
                    </div>
                    <h3 className={`text-xl font-semibold mb-4 ${categoryIndex % 2 === 0 ? 'text-white' : 'text-[#173559]'}`}>
                      {service.title}
                    </h3>
                    <p className={`mb-6 leading-relaxed ${categoryIndex % 2 === 0 ? 'text-white/80' : 'text-[#494B4F]'}`}>
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className={`flex items-start gap-2 text-sm ${categoryIndex % 2 === 0 ? 'text-white/70' : 'text-[#494B4F]'}`}>
                          <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${categoryIndex % 2 === 0 ? 'text-white/60' : 'text-[#173559]'}`} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Process Section */}
        <section className="py-20 bg-[#EDE5D4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-light text-[#173559] mb-6 italic">
                Our Approach
              </h2>
              <p className="text-xl text-[#494B4F] max-w-3xl mx-auto leading-relaxed">
                Every engagement is bespoke, designed to meet your specific needs and deliver 
                meaningful, actionable results.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-[#173559] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-[#173559] mb-3">Discovery</h3>
                <p className="text-[#494B4F]">
                  We begin by understanding your unique challenges, objectives, and constraints.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-[#173559] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-[#173559] mb-3">Analysis</h3>
                <p className="text-[#494B4F]">
                  Deep analytical work combining quantitative analysis with strategic insight.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-[#173559] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-[#173559] mb-3">Insights</h3>
                <p className="text-[#494B4F]">
                  Clear, actionable recommendations based on rigorous analysis and evidence.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-[#173559] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-xl font-bold">4</span>
                </div>
                <h3 className="text-xl font-semibold text-[#173559] mb-3">Implementation</h3>
                <p className="text-[#494B4F]">
                  Ongoing support to help you implement recommendations and achieve results.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#173559]">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h2 className="text-4xl font-light text-white mb-6 italic">
                Ready to get started?
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Let's discuss how our strategic advisory services can help your organization 
                achieve its objectives and navigate complex challenges.
              </p>
              <Link
                href="/contact"
                className="bg-white/20 backdrop-blur-sm border border-white/40 text-white px-8 py-4 rounded-md font-medium hover:bg-white/30 transition-all duration-300 inline-flex items-center gap-2"
              >
                Contact Us Today
              </Link>
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