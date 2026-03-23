import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const areaInfo = {
  main_hall: {
    name: 'Main Hall',
    description: 'The heart of The Hangar. Your journey begins here.',
    icon: '🏛️'
  },
  heritage_wing: {
    name: 'Aerospace Heritage Wing',
    description: 'Celebrating the pioneers who shaped aviation history.',
    icon: '✈️'
  },
  rd_lab: {
    name: 'R&D Laboratory',
    description: 'Where tomorrow\'s innovations take flight.',
    icon: '🔬'
  },
  innovator_hall: {
    name: 'Innovator Hall',
    description: 'Honoring the visionaries of aerospace.',
    icon: '💡'
  },
  runway_deck: {
    name: 'Runway Deck',
    description: 'Feel the rush of takeoff and landing.',
    icon: '🛫'
  },
  orbital_tower: {
    name: 'Orbital Tower',
    description: 'Reach for the stars. Space awaits.',
    icon: '🚀'
  },
};

export default function AreaDiscoveryToast({ area, isNew, onDismiss }) {
  const info = areaInfo[area] || { name: area, description: '', icon: '📍' };

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(onDismiss, 4000);
      return () => clearTimeout(timer);
    }
  }, [isNew, onDismiss]);

  return (
    <AnimatePresence>
      {isNew && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div 
            className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl px-8 py-5 shadow-2xl"
            style={{ border: `2px solid ${brandColors.goldPrestige}` }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-4xl"
              >
                {info.icon}
              </motion.div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                  <span className="text-xs uppercase tracking-widest" style={{ color: brandColors.goldPrestige }}>
                    Area Discovered
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {info.name}
                </h3>
                <p className="text-white/60 text-sm mt-1">{info.description}</p>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className="ml-4 flex items-center gap-1 px-3 py-1 rounded-full"
                style={{ background: `${brandColors.goldPrestige}30` }}
              >
                <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
                <span className="text-white font-bold">+50 IP</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}