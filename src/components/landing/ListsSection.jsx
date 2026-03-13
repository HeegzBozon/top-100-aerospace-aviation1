import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  cream: '#faf8f5',
  rose: '#9f1239',
};

const lists = [
  {
    title: 'TOP 100 Women in Aerospace & Aviation',
    description: 'Spotlighting trailblazers, leaders, and innovators transforming the industry.',
    accentColor: brandColors.rose,
    bgColor: '#fdf2f4',
  },
  {
    title: 'TOP 100 Aerospace & Aviation',
    description: 'Recognizing the sector\'s most influential figures across all disciplines.',
    accentColor: brandColors.goldPrestige,
    bgColor: '#fefbf3',
  },
  {
    title: 'TOP 100 Men in Aerospace & Aviation',
    description: 'Honoring leadership, achievement, and impact at the highest level.',
    accentColor: brandColors.navyDeep,
    bgColor: '#f1f5f9',
  },
];

export default function ListsSection() {
  return (
    <section className="py-24 bg-white">
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
            Explore the 2025 Classes
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ fontFamily: "'Montserrat', sans-serif", color: '#4a5568' }}
          >
            Three prestigious categories. One unified platform elevating aerospace excellence.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {lists.map((list, index) => (
            <motion.div
              key={list.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              style={{ background: list.bgColor, border: '1px solid #e2e8f0' }}
            >
              <div 
                className="h-1 w-16 rounded-full mb-6"
                style={{ background: list.accentColor }}
              />
              <h3 
                className="text-xl mb-3"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, color: brandColors.navyDeep }}
              >
                {list.title}
              </h3>
              <p className="mb-6" style={{ fontFamily: "'Montserrat', sans-serif", color: '#4a5568' }}>
                {list.description}
              </p>
              <Link to={createPageUrl('Arena')}>
                <Button 
                  variant="outline" 
                  className="group"
                  style={{ 
                    borderColor: brandColors.navyDeep, 
                    color: brandColors.navyDeep,
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  View the 2025 Class
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}