import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles, Award } from 'lucide-react';

const brandColors = {
  navyDeep: '#1e3a5a',
  goldPrestige: '#b8860b',
  skyBlue: '#4a90b8',
};

const tierColors = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2',
};

export default function AchievementPopup({ achievement, onDismiss }) {
  useEffect(() => {
    if (achievement) {
      // Vibrate on achievement
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 100, 200]);
      }
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onDismiss]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed top-24 right-4 z-50"
        >
          <div 
            className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 shadow-2xl flex items-center gap-4 min-w-80"
            style={{ border: `2px solid ${tierColors[achievement.tier] || brandColors.goldPrestige}` }}
          >
            {/* Icon */}
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: `${tierColors[achievement.tier] || brandColors.goldPrestige}30` }}
            >
              {achievement.icon === 'trophy' ? (
                <Trophy className="w-7 h-7" style={{ color: tierColors[achievement.tier] || brandColors.goldPrestige }} />
              ) : achievement.icon === 'star' ? (
                <Star className="w-7 h-7" style={{ color: tierColors[achievement.tier] || brandColors.goldPrestige }} />
              ) : (
                <Award className="w-7 h-7" style={{ color: tierColors[achievement.tier] || brandColors.goldPrestige }} />
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4" style={{ color: tierColors[achievement.tier] || brandColors.goldPrestige }} />
                <span 
                  className="text-xs uppercase tracking-widest font-bold"
                  style={{ color: tierColors[achievement.tier] || brandColors.goldPrestige }}
                >
                  Achievement Unlocked
                </span>
              </div>
              <h3 className="text-white font-bold text-lg">{achievement.name}</h3>
              <p className="text-white/60 text-sm">{achievement.description}</p>
            </div>

            {/* Points */}
            {achievement.points && (
              <div className="text-right">
                <div className="flex items-center gap-1" style={{ color: brandColors.goldPrestige }}>
                  <Star className="w-4 h-4" />
                  <span className="font-bold">+{achievement.points}</span>
                </div>
                <span className="text-white/40 text-xs">IP</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}