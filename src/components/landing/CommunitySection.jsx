import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Video, Newspaper, Sparkles, Calendar } from 'lucide-react';
import { User } from '@/entities/User';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#b8860b',
};

const features = [
  { icon: Newspaper, text: 'Monthly briefings' },
  { icon: Video, text: 'Digital roundtables' },
  { icon: Sparkles, text: 'Media opportunities' },
  { icon: MessageSquare, text: 'Professional amplification' },
  { icon: Calendar, text: 'Invites to future in-person events' },
];

export default function CommunitySection() {
  const handleJoin = async () => {
    try {
      const communityUrl = `${window.location.origin}${createPageUrl('HypeSquad')}`;
      await User.loginWithRedirect(communityUrl);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 
            className="text-3xl sm:text-4xl mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, color: brandColors.navyDeep }}
          >
            Where the Industry's Leaders Connect, Collaborate, and Shape the Future
          </h2>
          <p 
            className="text-lg max-w-3xl mx-auto"
            style={{ fontFamily: "'Montserrat', sans-serif", color: '#4a5568' }}
          >
            Honorees gain access to an exclusive network of executives, founders, engineers, 
            policy leaders, creators, and rising innovators—united by excellence and ambition.
            Our private community fosters conversation, connection, knowledge-sharing, and opportunity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl p-8 md:p-12 shadow-xl"
          style={{ border: '1px solid #e2e8f0' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              {features.map((feature) => (
                <div key={feature.text} className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${brandColors.skyBlue}20` }}
                  >
                    <feature.icon className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
                  </div>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", color: brandColors.navyDeep, fontWeight: 500 }}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center md:text-left">
              <Button
                size="lg"
                onClick={handleJoin}
                className="text-white font-bold text-lg px-8 py-6 rounded-full"
                style={{ 
                  background: brandColors.navyDeep,
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                Join the Community
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}