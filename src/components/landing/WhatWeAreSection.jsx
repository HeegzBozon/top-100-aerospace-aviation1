import React from 'react';
import { motion } from 'framer-motion';
import { Award, Megaphone, Handshake } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
};

const pillars = [
  {
    icon: Award,
    title: 'Recognition Engine',
    description: 'Celebrating the professionals driving innovation, leadership, and excellence.',
    color: brandColors.goldPrestige,
  },
  {
    icon: Megaphone,
    title: 'Influence Engine',
    description: 'Expanding visibility across media, community, and industry networks.',
    color: brandColors.skyBlue,
  },
  {
    icon: Handshake,
    title: 'Opportunity Engine',
    description: 'Connecting honorees with partners, employers, collaborators, and sponsors.',
    color: brandColors.navyDeep,
  },
];

export default function WhatWeAreSection() {
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
            className="text-3xl sm:text-4xl mb-6"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: brandColors.navyDeep }}
          >
            A Strategic Talent Recognition & Industry Influence Platform
          </h2>
          <p 
            className="text-lg max-w-3xl mx-auto"
            style={{ fontFamily: "'Montserrat', sans-serif", color: '#4a5568' }}
          >
            The TOP 100 identifies and elevates the most impactful people in Aerospace & Aviation.
            This platform brings visibility to excellence, amplifies industry-shaping voices, and creates 
            pathways for collaboration, opportunity, and long-term career impact.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-white rounded-2xl p-8 hover:shadow-xl transition-shadow"
              style={{ border: '1px solid #e2e8f0' }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ background: pillar.color }}
              >
                <pillar.icon className="w-7 h-7 text-white" />
              </div>
              <h3 
                className="text-xl mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, color: brandColors.navyDeep }}
              >
                {pillar.title}
              </h3>
              <p style={{ fontFamily: "'Montserrat', sans-serif", color: '#4a5568' }}>{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}