import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const brandColors = {
  navyDeep: '#1e3a5a',
  skyBlue: '#4a90b8',
  goldPrestige: '#c9a87c',
  goldLight: '#e8d4b8',
  cream: '#faf8f5',
};

export default function CountdownLanding({ onReveal }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Target: Midnight Pacific (PST/PDT) on Jan 1, 2026
    // PST = UTC-8, PDT = UTC-7. January is PST.
    const targetDate = new Date('2026-01-01T08:00:00Z'); // Midnight PST = 8AM UTC

    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setIsRevealed(true);
        if (onReveal) onReveal();
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [onReveal]);

  if (isRevealed) return null;

  const TimeBlock = ({ value, label }) => (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-5xl md:text-7xl lg:text-8xl font-light tabular-nums"
        style={{ 
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: brandColors.cream 
        }}
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <p 
        className="text-[10px] md:text-xs tracking-[0.3em] uppercase mt-2"
        style={{ color: brandColors.goldLight }}
      >
        {label}
      </p>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: brandColors.navyDeep }}
    >
      {/* Starfield Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ 
              background: brandColors.goldLight,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ 
              opacity: [0.1, 0.6, 0.1],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 2,
              repeat: Infinity 
            }}
          />
        ))}
      </div>

      {/* Gold accent lines */}
      <div 
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${brandColors.goldPrestige}, transparent)` }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${brandColors.goldPrestige}, transparent)` }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-center px-6"
      >
        {/* Pre-title */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] tracking-[0.5em] uppercase mb-6"
          style={{ color: brandColors.goldPrestige }}
        >
          The Orbital Edition
        </motion.p>

        {/* Main Title */}
        <h1 
          className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight mb-2"
          style={{ 
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: brandColors.cream 
          }}
        >
          TOP 100
        </h1>
        <h2 
          className="text-lg md:text-xl tracking-[0.2em] uppercase mb-12"
          style={{ color: brandColors.goldLight }}
        >
          Women in Aerospace & Aviation
        </h2>

        {/* Year */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <span 
            className="text-8xl md:text-9xl lg:text-[12rem] font-light"
            style={{ 
              fontFamily: 'Georgia, "Times New Roman", serif',
              color: brandColors.goldPrestige,
              textShadow: `0 0 60px ${brandColors.goldPrestige}40`
            }}
          >
            2025
          </span>
        </motion.div>

        {/* Countdown Label */}
        <p 
          className="text-[10px] tracking-[0.5em] uppercase mb-8"
          style={{ color: brandColors.skyBlue }}
        >
          Reveal In
        </p>

        {/* Countdown Timer */}
        <div className="flex items-center justify-center gap-6 md:gap-12">
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <span 
            className="text-4xl md:text-6xl font-light"
            style={{ color: brandColors.goldPrestige }}
          >
            :
          </span>
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <span 
            className="text-4xl md:text-6xl font-light"
            style={{ color: brandColors.goldPrestige }}
          >
            :
          </span>
          <TimeBlock value={timeLeft.seconds} label="Seconds" />
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-xs"
          style={{ color: `${brandColors.cream}50` }}
        >
          Midnight Pacific · January 1, 2026
        </motion.p>
      </motion.div>
    </div>
  );
}