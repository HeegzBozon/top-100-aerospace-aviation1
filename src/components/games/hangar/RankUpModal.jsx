import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const rankData = {
  Bronze: { color: '#cd7f32', icon: '🥉', next: 'Silver', threshold: 500 },
  Silver: { color: '#c0c0c0', icon: '🥈', next: 'Gold', threshold: 2000 },
  Gold: { color: '#ffd700', icon: '🥇', next: 'BlackBox', threshold: 5000 },
  BlackBox: { color: '#1a1a2e', icon: '📦', next: 'Platinum', threshold: 10000 },
  Platinum: { color: '#e5e4e2', icon: '💎', next: null, threshold: null },
};

export default function RankUpModal({ newRank, onDismiss }) {
  const rank = rankData[newRank];

  useEffect(() => {
    if (newRank) {
      // Celebration vibration pattern
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200]);
      }
    }
  }, [newRank]);

  return (
    <AnimatePresence>
      {newRank && rank && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={onDismiss}
        >
          {/* Particles */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 1, 
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{ 
                opacity: 0, 
                scale: 1,
                x: (Math.random() - 0.5) * 500,
                y: (Math.random() - 0.5) * 500,
              }}
              transition={{ duration: 2, delay: i * 0.03 }}
              className="absolute w-3 h-3 rounded-full"
              style={{ 
                background: rank.color,
                left: '50%',
                top: '50%'
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: 'spring', damping: 12, delay: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative text-center max-w-md w-full"
          >
            {/* Glow */}
            <div 
              className="absolute inset-0 rounded-3xl blur-3xl opacity-40"
              style={{ background: rank.color }}
            />

            <div 
              className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-10"
              style={{ border: `3px solid ${rank.color}` }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.4 }}
                className="mb-6"
              >
                <div className="text-8xl mb-4">{rank.icon}</div>
                <ChevronUp className="w-12 h-12 mx-auto" style={{ color: rank.color }} />
              </motion.div>

              <div className="flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" style={{ color: rank.color }} />
                <span 
                  className="text-sm uppercase tracking-widest font-bold"
                  style={{ color: rank.color }}
                >
                  Rank Up!
                </span>
                <Sparkles className="w-5 h-5" style={{ color: rank.color }} />
              </div>

              <h2 
                className="text-5xl font-bold text-white mb-4"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {newRank}
              </h2>

              <p className="text-white/70 mb-8 text-lg">
                You've proven your worth in the aerospace realm. 
                New privileges and artifacts await.
              </p>

              {rank.next && (
                <p className="text-white/40 text-sm mb-6">
                  Next rank: <span style={{ color: rankData[rank.next]?.color }}>{rank.next}</span> at {rank.threshold} IP
                </p>
              )}

              <Button
                onClick={onDismiss}
                className="px-10 py-6 text-lg font-semibold"
                style={{ 
                  background: `linear-gradient(135deg, ${rank.color}, ${rank.color}cc)`,
                  color: newRank === 'BlackBox' ? 'white' : 'black'
                }}
              >
                <Star className="w-5 h-5 mr-2" />
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}