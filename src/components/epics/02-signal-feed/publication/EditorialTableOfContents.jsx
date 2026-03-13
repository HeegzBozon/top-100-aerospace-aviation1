import React from 'react';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
  ink: '#1a1a1a',
};

const sections = [
  { 
    number: '01', 
    title: 'The Manifesto', 
    subtitle: 'Why this list exists',
    anchor: 'manifesto',
  },
  { 
    number: '02', 
    title: 'Featured Portraits', 
    subtitle: 'Leaders in focus',
    anchor: 'portraits',
  },
  { 
    number: '03', 
    title: 'The Index', 
    subtitle: 'Complete directory',
    anchor: 'honorees',
  },
  { 
    number: '04', 
    title: 'Connections', 
    subtitle: 'Network & geography',
    anchor: 'orbital-index',
  },
  { 
    number: '05', 
    title: 'Signal Report', 
    subtitle: 'Data & insights',
    anchor: 'signal-report',
  },
  { 
    number: '06', 
    title: 'Archive', 
    subtitle: 'Export & continuity',
    anchor: 'archive',
  },
];

export default function EditorialTableOfContents() {
  return (
    <section className="py-24 md:py-40 px-6 md:px-12 lg:px-24" style={{ background: brandColors.cream }}>
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p 
            className="text-xs tracking-[0.4em] uppercase mb-4"
            style={{ color: brandColors.skyBlue }}
          >
            Contents
          </p>
          <div className="w-12 h-px" style={{ background: brandColors.ink }} />
        </motion.div>

        {/* TOC Items */}
        <div className="space-y-0">
          {sections.map((section, i) => (
            <motion.a
              key={section.number}
              href={`#${section.anchor}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group block py-8 border-t transition-all duration-300 hover:pl-4"
              style={{ borderColor: `${brandColors.ink}15` }}
            >
              <div className="flex items-baseline justify-between gap-8">
                <div className="flex items-baseline gap-6 md:gap-12">
                  {/* Number */}
                  <span 
                    className="text-sm font-light tabular-nums"
                    style={{ color: brandColors.skyBlue }}
                  >
                    {section.number}
                  </span>
                  
                  {/* Title */}
                  <div>
                    <h3 
                      className="text-2xl md:text-4xl font-light tracking-tight transition-colors duration-300"
                      style={{ 
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        color: brandColors.ink 
                      }}
                    >
                      {section.title}
                    </h3>
                    <p 
                      className="mt-1 text-sm font-light"
                      style={{ color: `${brandColors.ink}60` }}
                    >
                      {section.subtitle}
                    </p>
                  </div>
                </div>

                {/* Arrow indicator */}
                <span 
                  className="hidden md:block text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: brandColors.goldPrestige }}
                >
                  →
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Footer Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 h-px origin-left"
          style={{ background: brandColors.ink }}
        />
      </div>
    </section>
  );
}