import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CheckSquare, Plus } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
};

export default function EngagementCTA({ currentUser, onVoteClick, onNominateClick }) {
  const ctaVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={ctaVariants}
      initial="hidden"
      animate="visible"
      className="rounded-3xl shadow-xl my-8 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${brandColors.skyBlue}, ${brandColors.navyDeep})`,
      }}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8">
        <div className="text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">TOP 100 Aerospace & Aviation</h3>
          <p className="text-white/90 text-base">Season 4 Nominations Now Open</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={onNominateClick}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/95 hover:bg-white transition-all shadow-lg font-semibold"
            style={{ color: brandColors.navyDeep }}
          >
            <Plus className="w-5 h-5" />
            <span>Nominate</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}