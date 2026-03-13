import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Eye, Target } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

const benefits = [
  { icon: Eye, text: 'Premium Brand Visibility' },
  { icon: Target, text: 'Direct Access to Top Talent' },
  { icon: Building2, text: 'Industry Leadership Positioning' },
];

export default function SponsorshipSection() {
  const handleRequestDeck = () => {
    window.location.href = 'mailto:sponsors@top100aerospace.com?subject=Sponsorship%20Deck%20Request';
  };

  return (
    <section 
      id="sponsorship" 
      className="py-24 text-white"
      style={{ background: `linear-gradient(135deg, ${brandColors.navyDeep} 0%, #0f1f33 50%, ${brandColors.navyDeep} 100%)` }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-3xl sm:text-4xl mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
            >
              Partner With Aerospace's Most Influential Recognition Platform
            </h2>
            <p 
              className="text-lg mb-8"
              style={{ fontFamily: "'Montserrat', sans-serif", color: 'rgba(255,255,255,0.7)' }}
            >
              Sponsorship grants your organization visibility, credibility, and direct access 
              to the industry's top talent and rising stars. Join major companies, innovators, 
              and institutions in shaping the future of Aerospace & Aviation.
            </p>
            <Button
              size="lg"
              onClick={handleRequestDeck}
              className="text-white font-bold text-lg px-8 py-6 rounded-full"
              style={{ 
                background: `linear-gradient(135deg, ${brandColors.goldPrestige}, #d4a84b)`,
                fontFamily: "'Montserrat', sans-serif"
              }}
            >
              Request Sponsorship Deck
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {benefits.map((benefit) => (
              <div 
                key={benefit.text}
                className="flex items-center gap-4 p-6 backdrop-blur-sm rounded-xl"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: `${brandColors.goldPrestige}30` }}
                >
                  <benefit.icon className="w-6 h-6" style={{ color: brandColors.goldPrestige }} />
                </div>
                <span className="text-lg font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {benefit.text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}