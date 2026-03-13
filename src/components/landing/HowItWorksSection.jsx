import React from 'react';
import { motion } from 'framer-motion';
import { Send, Search, BarChart3, Megaphone, Users } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

const steps = [
  {
    icon: Send,
    title: 'Nominations Open',
    description: 'The community submits outstanding leaders, innovators, creators, and professionals.',
  },
  {
    icon: Search,
    title: 'Review & Evaluation',
    description: 'Our team conducts a structured, multi-stage assessment process.',
  },
  {
    icon: BarChart3,
    title: 'Ranking & Selection',
    description: 'Final honorees are determined using a transparent, criteria-driven model.',
  },
  {
    icon: Megaphone,
    title: 'Announcement & Publishing',
    description: 'Honorees are revealed in the annual digital release, amplified across global channels.',
  },
  {
    icon: Users,
    title: 'Alumni & Community',
    description: 'Ongoing roundtables, media opportunities, workshops, and connection-building.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24" style={{ background: brandColors.cream }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 
            className="text-3xl sm:text-4xl mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: brandColors.navyDeep }}
          >
            The Annual Selection & Publishing Cycle
          </h2>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div 
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5"
            style={{ background: `linear-gradient(to bottom, ${brandColors.goldPrestige}, ${brandColors.skyBlue}, ${brandColors.navyDeep})` }}
          />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <div 
                    className={`bg-white rounded-2xl p-6 inline-block max-w-md ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}
                    style={{ border: '1px solid #e2e8f0' }}
                  >
                    <h3 
                      className="text-lg mb-2"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, color: brandColors.navyDeep }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", color: '#4a5568' }}>{step.description}</p>
                  </div>
                </div>
                
                <div 
                  className="hidden md:flex w-14 h-14 rounded-full items-center justify-center flex-shrink-0 shadow-lg z-10"
                  style={{ background: `linear-gradient(135deg, ${brandColors.goldPrestige}, ${brandColors.goldLight})` }}
                >
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}