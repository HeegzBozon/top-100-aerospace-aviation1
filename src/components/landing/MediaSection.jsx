import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  cream: '#faf8f5',
};

export default function MediaSection() {
  return (
    <section className="py-24" style={{ background: brandColors.cream }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 
            className="text-3xl sm:text-4xl mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: brandColors.navyDeep }}
          >
            A Platform Amplified Across the Global Aerospace Ecosystem
          </h2>
          <p 
            className="text-lg max-w-3xl mx-auto mb-12"
            style={{ fontFamily: "'Montserrat', sans-serif", color: '#4a5568' }}
          >
            Our honorees and sponsors have been featured in industry publications, 
            conferences, and digital media worldwide.
          </p>

          {/* Placeholder for press logos */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center opacity-30">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="h-12 rounded-lg flex items-center justify-center"
                style={{ background: brandColors.navyDeep }}
              >
                <Newspaper className="w-6 h-6 text-white opacity-50" />
              </div>
            ))}
          </div>
          <p 
            className="text-sm mt-8"
            style={{ fontFamily: "'Montserrat', sans-serif", color: '#9ca3af' }}
          >
            Press logos coming soon
          </p>
        </motion.div>
      </div>
    </section>
  );
}