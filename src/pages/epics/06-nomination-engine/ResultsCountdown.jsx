import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Rocket, Trophy } from 'lucide-react';
import { createPageUrl } from '@/utils';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

// Target: Jan 1, 2026 at midnight Pacific Time (UTC-8)
const TARGET_DATE = new Date('2026-01-01T00:00:00-08:00');

export default function ResultsCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = TARGET_DATE - now;

      if (diff <= 0) {
        setIsComplete(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Redirect to publication when countdown is complete
  useEffect(() => {
    if (isComplete) {
      window.location.href = createPageUrl('Top100Women2025');
    }
  }, [isComplete]);

  const TimeBlock = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div 
        className="w-20 h-20 md:w-28 md:h-28 rounded-2xl flex items-center justify-center text-3xl md:text-5xl font-bold shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${brandColors.navyDeep}, ${brandColors.skyBlue})`,
          color: 'white'
        }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span 
        className="mt-2 text-xs md:text-sm font-semibold uppercase tracking-wider"
        style={{ color: brandColors.skyBlue }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: brandColors.cream }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-1/2 -left-1/2 w-full h-full opacity-5"
          style={{ 
            background: `conic-gradient(from 0deg, ${brandColors.goldPrestige}, transparent, ${brandColors.skyBlue}, transparent, ${brandColors.goldPrestige})`
          }}
        />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: [-20, -100],
              x: Math.sin(i) * 50
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: 'easeOut'
            }}
            className="absolute"
            style={{
              left: `${5 + (i * 5)}%`,
              bottom: '10%',
            }}
          >
            <Star className="w-4 h-4" style={{ color: brandColors.goldPrestige }} />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-3xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: `${brandColors.goldPrestige}20`, color: brandColors.goldPrestige }}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">Results Incoming</span>
        </motion.div>

        {/* Title */}
        <h1 
          className="text-4xl md:text-6xl font-bold mb-4"
          style={{ color: brandColors.navyDeep }}
        >
          TOP 100 Women in
          <br />
          <span style={{ color: brandColors.goldPrestige }}>Aerospace & Aviation</span>
        </h1>

        <p 
          className="text-lg md:text-xl mb-8 max-w-xl mx-auto"
          style={{ color: brandColors.skyBlue }}
        >
          The official 2025 publication drops at midnight Pacific on New Year's Day
        </p>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-3 md:gap-6 mb-10">
          <TimeBlock value={timeLeft.days} label="Days" />
          <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>:</div>
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>:</div>
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <div className="text-3xl font-bold" style={{ color: brandColors.navyDeep }}>:</div>
          <TimeBlock value={timeLeft.seconds} label="Seconds" />
        </div>

        {/* Trophy animation */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [-2, 2, -2]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-8"
        >
          <Trophy className="w-24 h-24 mx-auto" style={{ color: brandColors.goldPrestige }} />
        </motion.div>

        {/* Subtext */}
        <p 
          className="text-sm mb-6"
          style={{ color: `${brandColors.navyDeep}80` }}
        >
          Thank you for participating in Season 3 voting. The results are being finalized.
        </p>

        {/* CTA */}
        <motion.a
          href={createPageUrl('MissionControl')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all"
          style={{ 
            background: brandColors.navyDeep, 
            color: 'white',
            boxShadow: `0 4px 20px ${brandColors.navyDeep}40`
          }}
        >
          <Rocket className="w-4 h-4" />
          Back to Mission Control
        </motion.a>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-4 text-center">
        <p className="text-xs" style={{ color: `${brandColors.navyDeep}50` }}>
          © 2025 TOP 100 Aerospace & Aviation
        </p>
      </div>
    </div>
  );
}