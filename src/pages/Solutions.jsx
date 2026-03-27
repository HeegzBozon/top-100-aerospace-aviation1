import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Globe, Smartphone, Share2, Zap, Volume2, Cloud, Brain, Rocket, TestTube, Briefcase, TrendingUp, Truck, Palette, Calendar } from 'lucide-react';

const SOLUTIONS = [
  {
    id: 1,
    icon: Globe,
    title: 'High-Authority Websites',
    description: 'Program-centric architecture designed for institutional credibility and search dominance.',
    features: [
      'Canonical Program Pages for flagship initiatives (Falcon 9, Artemis)',
      'Authority-based institutional signaling vs. attention marketing',
      'Industry-specific SEO optimization for recruiters & investors',
    ],
  },
  {
    id: 2,
    icon: Smartphone,
    title: 'Proprietary Apps & Talent Interfaces',
    description: 'Custom platforms with reputation-weighted governance and peer validation.',
    features: [
      'Flightography™ Integration for career credit records',
      'Governance layers with verified contributor workflows',
      'Social graphs that build thriving institutional communities',
    ],
  },
  {
    id: 3,
    icon: Share2,
    title: 'High-Impact Social & Narrative',
    description: 'Aerospace-grade content strategy focused on earned influence and prestige.',
    features: [
      'Mythic messaging cadences for exclusive positioning',
      'Authority through verified contributions over fragmented PR',
      'Founder-led visibility & prestige-driven announcements',
    ],
  },
  {
    id: 4,
    icon: Zap,
    title: 'Gamified Professional Environments',
    description: 'Interactive talent graphs and competitive credibility platforms.',
    features: [
      'Talent Graph visualization of aerospace ecosystem contributions',
      'Pairwise voting for engagement-driven industry recognition',
      'Immersive simulation & verified aerospace steward training',
    ],
  },
  {
    id: 5,
    icon: Volume2,
    title: 'Public Speaking & Executive Presence',
    description: 'Strategic communication coaching and narrative development for industry leadership.',
    features: [
      'Executive messaging frameworks for conferences & keynotes',
      'Media training and thought leadership positioning',
      'Presentation design for technical and non-technical audiences',
    ],
  },
  {
    id: 6,
    icon: Cloud,
    title: 'Cloud Architecture & DevOps',
    description: 'Enterprise infrastructure and deployment pipelines built for scale and reliability.',
    features: [
      'Multi-cloud architecture design and optimization',
      'CI/CD pipeline implementation and automation',
      'Kubernetes & containerization for aerospace-grade systems',
    ],
  },
  {
    id: 7,
    icon: Brain,
    title: 'Perception Engineering (ADAS)',
    description: 'Advanced driver assistance systems and autonomous vehicle perception layers.',
    features: [
      'Computer vision pipeline development for real-time detection',
      'Machine learning model training on aerospace-grade datasets',
      'Safety validation and certification-ready testing protocols',
    ],
  },
  {
    id: 8,
    icon: Rocket,
    title: 'Venture Studio',
    description: 'Full-service startup acceleration and early-stage venture building.',
    features: [
      'Idea validation and business model development',
      'Funding strategy and investor pitch preparation',
      'Go-to-market strategy and initial scaling support',
    ],
  },
  {
    id: 9,
    icon: TestTube,
    title: 'Hill Lab Testing Platform',
    description: 'Proprietary testing framework and validation infrastructure for aerospace systems.',
    features: [
      'Automated test suite generation and execution',
      'Real-time monitoring and failure analysis dashboards',
      'Compliance reporting aligned with ASPICE & DO-254',
    ],
  },
  {
    id: 10,
    icon: Briefcase,
    title: 'Engineering Program Management',
    description: 'Strategic oversight and delivery of complex aerospace programs.',
    features: [
      'Integrated planning, scheduling, and budget tracking',
      'Risk mitigation and milestone management frameworks',
      'Cross-functional team coordination and reporting',
    ],
  },
  {
    id: 11,
    icon: TrendingUp,
    title: 'Sales & Marketing',
    description: 'Go-to-market strategies and demand generation for aerospace products.',
    features: [
      'Sales enablement and collateral development',
      'Market positioning and competitive analysis',
      'Lead generation and pipeline acceleration',
    ],
  },
  {
    id: 12,
    icon: Truck,
    title: 'Delivery & Support',
    description: 'End-to-end implementation and ongoing customer success programs.',
    features: [
      'Project delivery with quality assurance protocols',
      ' 24/7 technical support and incident management',
      'Customer training and knowledge transfer',
    ],
  },
  {
    id: 13,
    icon: Palette,
    title: 'Creative Strategy',
    description: 'Brand storytelling and creative direction for aerospace organizations.',
    features: [
      'Brand identity development and visual design systems',
      'Campaign creative and messaging frameworks',
      'Editorial strategy and content roadmaps',
    ],
  },
  {
    id: 14,
    icon: Calendar,
    title: 'Events - Live & Virtual',
    description: 'Full-service event production and experiential marketing.',
    features: [
      'Conference production and speaker management',
      'Virtual and hybrid event platforms and execution',
      'Networking experiences and attendee engagement',
    ],
  },
  {
    id: 15,
    icon: Volume2,
    title: 'Training & Workshops',
    description: 'Custom education and professional development programs.',
    features: [
      'Curriculum design for aerospace certifications',
      'Executive coaching and leadership development',
      'Technical skills training and upskilling programs',
    ],
  },
];

const DELIVERY_PHASES = [
  {
    phase: 'Foundation',
    action: 'Architecture & MVP Profiles',
    outcome: 'Rapid Deployment of Core Assets',
  },
  {
    phase: 'Integration',
    action: 'Recognition Engine & Workflows',
    outcome: 'Automated Authority Generation',
  },
  {
    phase: 'Expansion',
    action: 'Community Loops & Social Graph',
    outcome: 'Compounding Ecosystem Growth',
  },
  {
    phase: 'Archive',
    action: 'Institutional Continuity',
    outcome: 'Permanent Industry Legacy',
  },
];

export default function Solutions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1e3a5a] to-[#0f2438] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl sm:text-6xl font-bold mb-4 font-serif text-[#D4A574] leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Top 100 Aerospace & Aviation Solutions
          </motion.h1>
          <motion.p 
            className="text-slate-300 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            TOP 100 OS functions as the aerospace industry's Systems Architect and Narrative Engine, deploying elite creative solutions to bridge technical complexity and market-dominating authority.
          </motion.p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.p 
          className="text-xl text-slate-700 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          The aerospace industry is built on precision engineering and high-stakes innovation, yet its digital presence often lags behind its physical achievements. Every digital asset we build is governed by the <span className="font-semibold text-[#1e3a5a]">ASPICE V-Model</span>, ensuring rigorous alignment between your brand's strategic goals and final deployment.
        </motion.p>
      </div>

      {/* Solutions Grid */}
      <div className="bg-gradient-to-b from-[#faf8f5] to-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-[#1e3a5a] mb-4 font-serif text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Digital Product Line
          </motion.h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Sixteen integrated solution categories designed to transform your digital presence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTIONS.map((solution, idx) => {
              const Icon = solution.icon;
              return (
                <motion.div
                  key={solution.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-brand-navy-08 hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="w-8 h-8 text-[#D4A574]" />
                    <h3 className="text-2xl font-bold text-[#1e3a5a] font-serif">{solution.title}</h3>
                  </div>
                  <p className="text-slate-700 mb-6">{solution.description}</p>
                  <ul className="space-y-3">
                    {solution.features.map((feature, i) => (
                      <li key={i} className="flex gap-3 text-slate-600">
                        <span className="text-[#D4A574] font-bold">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delivery Framework */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <motion.h2 
          className="text-4xl font-bold text-[#1e3a5a] mb-12 font-serif text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          TOP 100 Delivery Framework
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DELIVERY_PHASES.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#D4A574]"
            >
              <div className="text-[#D4A574] font-bold text-sm uppercase tracking-widest mb-2">
                Phase {idx + 1}
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5a] mb-2 font-serif">{item.phase}</h3>
              <p className="text-slate-600 text-sm mb-4"><span className="font-semibold">Action:</span> {item.action}</p>
              <p className="text-slate-700"><span className="font-semibold text-[#1e3a5a]">Outcome:</span> {item.outcome}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Closing Section */}
      <div className="bg-gradient-to-r from-[#1e3a5a] to-[#0f2438] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-6 font-serif"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Build for Scale. Move with Rigor.
          </motion.h2>
          <motion.p 
            className="text-slate-300 text-lg max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Our creative agency solutions are the transformation systems that turn a simple list into a full institutional ecosystem. We are building the record that aerospace never had.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button className="bg-[#D4A574] text-white hover:bg-[#C19A6B] text-lg px-8 py-4 h-auto">
              Launch Your Project Build
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto">
              Apply for Strategic Residency
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}