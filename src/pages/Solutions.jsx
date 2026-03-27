import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Globe, Smartphone, Share2, Zap } from 'lucide-react';

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
      <div className="bg-gradient-to-r from-brand-navy to-slate-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-5xl sm:text-6xl font-bold mb-4 font-serif text-brand-gold leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Digital Excellence & Creative Solutions
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
          The aerospace industry is built on precision engineering and high-stakes innovation, yet its digital presence often lags behind its physical achievements. Every digital asset we build is governed by the <span className="font-semibold text-brand-navy">ASPICE V-Model</span>, ensuring rigorous alignment between your brand's strategic goals and final deployment.
        </motion.p>
      </div>

      {/* Solutions Grid */}
      <div className="bg-gradient-to-b from-slate-50 to-white px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-brand-navy mb-4 font-serif text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Digital Product Line
          </motion.h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Four integrated solution categories designed to transform your digital presence.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                    <Icon className="w-8 h-8 text-brand-gold" />
                    <h3 className="text-2xl font-bold text-brand-navy font-serif">{solution.title}</h3>
                  </div>
                  <p className="text-slate-700 mb-6">{solution.description}</p>
                  <ul className="space-y-3">
                    {solution.features.map((feature, i) => (
                      <li key={i} className="flex gap-3 text-slate-600">
                        <span className="text-brand-gold font-bold">•</span>
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
          className="text-4xl font-bold text-brand-navy mb-12 font-serif text-center"
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
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-brand-gold"
            >
              <div className="text-brand-gold font-bold text-sm uppercase tracking-widest mb-2">
                Phase {idx + 1}
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-2 font-serif">{item.phase}</h3>
              <p className="text-slate-600 text-sm mb-4"><span className="font-semibold">Action:</span> {item.action}</p>
              <p className="text-slate-700"><span className="font-semibold text-brand-navy">Outcome:</span> {item.outcome}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Closing Section */}
      <div className="bg-gradient-to-r from-brand-navy to-slate-900 text-white py-16 px-6">
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
            <Button className="bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-lg px-8 py-4 h-auto">
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