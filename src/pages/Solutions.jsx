import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ConstellationBackground from '@/components/comms/ConstellationBackground';
import { Globe, Smartphone, Share2, Zap, Volume2, Cloud, Brain, Rocket, TestTube, Briefcase, TrendingUp, Truck, Palette, Calendar } from 'lucide-react';

const SOLUTION_CATEGORIES = [
  {
    name: 'Build Institutional Authority',
    description: 'Digital infrastructure that signals mastery and attracts top talent.',
    solutions: [
      {
        id: 1,
        icon: Globe,
        title: 'High-Authority Websites',
        description: 'Program-centric architecture for institutional credibility.',
      },
      {
        id: 2,
        icon: Smartphone,
        title: 'Proprietary Apps & Talent Interfaces',
        description: 'Custom platforms with verified governance.',
      },
      {
        id: 3,
        icon: Share2,
        title: 'High-Impact Social & Narrative',
        description: 'Content strategy for earned influence.',
      },
      {
        id: 13,
        icon: Palette,
        title: 'Creative Strategy',
        description: 'Brand storytelling and visual direction.',
      },
    ],
  },
  {
    name: 'Engage & Compete',
    description: 'Gamified platforms and professional environments.',
    solutions: [
      {
        id: 4,
        icon: Zap,
        title: 'Gamified Professional Environments',
        description: 'Interactive talent graphs and credibility platforms.',
      },
      {
        id: 5,
        icon: Volume2,
        title: 'Public Speaking & Executive Presence',
        description: 'Strategic communication coaching.',
      },
      {
        id: 14,
        icon: Calendar,
        title: 'Events - Live & Virtual',
        description: 'Full-service event production.',
      },
      {
        id: 15,
        icon: Volume2,
        title: 'Training & Workshops',
        description: 'Custom education programs.',
      },
    ],
  },
  {
    name: 'Engineer & Scale',
    description: 'Technical infrastructure for aerospace-grade systems.',
    solutions: [
      {
        id: 6,
        icon: Cloud,
        title: 'Cloud Architecture & DevOps',
        description: 'Enterprise infrastructure and deployment.',
      },
      {
        id: 7,
        icon: Brain,
        title: 'Perception Engineering (ADAS)',
        description: 'AI and autonomous vehicle systems.',
      },
      {
        id: 9,
        icon: TestTube,
        title: 'Hill Lab Testing Platform',
        description: 'Proprietary testing and validation.',
      },
      {
        id: 10,
        icon: Briefcase,
        title: 'Engineering Program Management',
        description: 'Strategic program delivery.',
      },
    ],
  },
  {
    name: 'Grow & Accelerate',
    description: 'Market expansion and venture acceleration.',
    solutions: [
      {
        id: 8,
        icon: Rocket,
        title: 'Venture Studio',
        description: 'Startup acceleration and venture building.',
      },
      {
        id: 11,
        icon: TrendingUp,
        title: 'Sales & Marketing',
        description: 'Go-to-market and demand generation.',
      },
      {
        id: 12,
        icon: Truck,
        title: 'Delivery & Support',
        description: 'Implementation and customer success.',
      },
    ],
  },
];

const JOURNEY_STEPS = [
  { step: 1, title: 'Discovery', description: 'Map your market position and institutional gaps.' },
  { step: 2, title: 'Build', description: 'Construct your unified authority architecture.' },
  { step: 3, title: 'Launch', description: 'Go live with institutional presence.' },
  { step: 4, title: 'Lead', description: 'Dominate your market as the category authority.' },
];

export default function Solutions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="min-h-[700px] bg-white px-6 py-24 flex items-center justify-center">
        {/* Glass Card Container with Constellation */}
        <motion.div 
          className="relative max-w-4xl mx-auto backdrop-blur-xl bg-gradient-to-br from-[#1e3a5a] to-[#0f2438] border border-white/10 rounded-3xl p-12 md:p-16 shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Constellation in Card */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <ConstellationBackground />
          </div>
          
          {/* Content Layer */}
          <div className="relative z-10 text-center">
            <motion.div
              className="inline-block mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-[#D4A574]/10 border border-[#D4A574]/30 backdrop-blur-sm">
                <span className="text-[#D4A574] text-sm font-bold uppercase tracking-widest">Elite Solutions for Aerospace</span>
              </div>
            </motion.div>
            
            <motion.h1 
              className="text-5xl sm:text-6xl font-bold mb-6 font-serif text-[#D4A574] leading-tight text-pretty"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Aerospace &amp; Aviation Solutions
            </motion.h1>
            
            <motion.p 
              className="text-xl text-slate-200 max-w-3xl mx-auto mb-8 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Right now, your best talent is evaluating you on platforms you don't control. Your competitors are building institutional authority while you manage legacy systems. Investor confidence depends on signals you're not sending. But the cost of inaction is compounding every month you wait. TOP 100 OS changes that. In 90 days, you'll have the digital infrastructure that signals mastery, attracts capital, and wins the war for talent.
            </motion.p>
            
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button className="bg-[#D4A574] text-white hover:bg-[#C19A6B] transition-colors duration-200 text-base px-10 py-3 h-auto font-semibold rounded-full">
                Start Your Journey
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Intro Section */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.p 
          className="text-lg text-slate-700 leading-relaxed max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          You're competing for three things: talent, capital, and market position. Digital institutions win all three. Your current infrastructure was designed for a different era—internal operations, not institutional presence. The barrier to entry is no longer technical. It's institutional credibility. Every day you delay, your competitors are closing the gap. We've built the exact system that aerospace and defense leaders use: architected with aerospace-grade discipline, governed by the <span className="font-semibold text-[#1e3a5a]">ASPICE V-Model</span>, and proven by organizations leading multi-billion-dollar programs.
        </motion.p>
      </div>

      {/* Solutions by Category */}
      <div className="bg-white px-6 py-24">
        {SOLUTION_CATEGORIES.map((category, catIdx) => (
          <motion.div
            key={catIdx}
            className="max-w-6xl mx-auto mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: catIdx * 0.1 }}
          >
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-[#1e3a5a] mb-2 font-serif">{category.name}</h2>
              <p className="text-slate-600 text-base leading-relaxed max-w-2xl">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {category.solutions.map((solution, idx) => {
                const Icon = solution.icon;
                return (
                  <motion.button
                    key={solution.id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-[#D4A574] hover:shadow-lg transition-all duration-200 group"
                    whileHover={{ y: -4 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Icon className="w-10 h-10 text-[#D4A574] mb-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                    <h3 className="text-lg font-semibold text-[#1e3a5a] mb-2">{solution.title}</h3>
                    <p className="text-sm text-slate-600">{solution.description}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Journey Timeline */}
      <div className="bg-gradient-to-b from-white to-[#faf8f5] px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1e3a5a] mb-16 font-serif text-center">Your Path Forward</h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#D4A574] to-[#D4A574]/20 hidden md:block -translate-x-1/2" />
            
            <div className="space-y-8">
              {JOURNEY_STEPS.map((item, idx) => (
                <motion.div
                  key={idx}
                  className={`flex gap-8 md:gap-0 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="md:w-1/2" />
                  <div className="relative flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-[#D4A574] border-4 border-white ring-1 ring-[#D4A574]/20" />
                  </div>
                  <div className="md:w-1/2 pb-8 md:pb-0">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                      <div className="text-[#D4A574] font-bold text-sm uppercase tracking-widest mb-1">Step {item.step}</div>
                      <h3 className="text-2xl font-bold text-[#1e3a5a] mb-2 font-serif">{item.title}</h3>
                      <p className="text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Closing Section */}
      <div className="bg-gradient-to-r from-[#1e3a5a] to-[#0f2438] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-6 font-serif text-[#D4A574]"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Authority Built for Aerospace.
          </motion.h2>
          <motion.p 
            className="text-slate-200 text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Imagine 90 days from now. Your institutional platform is live. Top talent sees it and wants in. Investors recognize the institutional maturity. Your market position is visibly stronger. That's what happens when you move. Now imagine 90 days from now with no change—same gap in the market, same talent questions, same investor uncertainty. The cost of waiting is real. The leaders in your space are already ahead. We work with organizations managing $50B+ in programs and leading the global market. When they move, it matters. When you move, it will too.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button className="bg-[#D4A574] text-[#1e3a5a] hover:bg-[#C19A6B] transition-colors duration-200 text-lg px-10 py-4 h-auto font-semibold rounded-full">
              Request Executive Briefing
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}