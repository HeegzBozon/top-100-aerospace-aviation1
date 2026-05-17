import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INTERLUDE_LINES = [
  "Telemetry received. Processing flight data…",
  "Cross-referencing mission parameters…",
  "Navigating decision matrix…",
  "Reading the airspace…",
  "Scanning for signal…",
  "Calculating trajectory…",
  "Compiling mission log…",
  "Decoding your last transmission…",
];

const BOSS_LINES = [
  "The moment is here. Calculating outcome…",
  "All stats weighed. Fate is being computed…",
  "The ops room goes quiet…",
  "Processing your roll. This is the one that counts…",
  "Final vector confirmed. Outcome incoming…",
];

export default function TransitionInterlude({ isBoss = false }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [dots, setDots] = useState('');
  const lines = isBoss ? BOSS_LINES : INTERLUDE_LINES;

  // Cycle through narrative lines
  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex(i => (i + 1) % lines.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [lines]);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg text-center">

        {/* Animated radar ring */}
        <div className="relative w-28 h-28 mx-auto mb-12">
          {/* Outer rings */}
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-[#c9a87c]/20"
              animate={{ scale: [1, 1.6 + i * 0.3], opacity: [0.4, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
            />
          ))}
          {/* Core */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{ background: 'radial-gradient(circle, rgba(201,168,124,0.15) 0%, transparent 70%)' }}>
            <motion.div
              className="w-3 h-3 rounded-full bg-[#c9a87c]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </div>
          {/* Sweep line */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            <div className="absolute top-1/2 left-1/2 w-1/2 h-px origin-left"
              style={{ background: 'linear-gradient(90deg, rgba(201,168,124,0.7), transparent)' }} />
          </motion.div>
        </div>

        {/* Narrative line */}
        <AnimatePresence mode="wait">
          <motion.p
            key={lineIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            className="text-white/60 text-base leading-relaxed font-medium mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            {lines[lineIndex]}
          </motion.p>
        </AnimatePresence>

        <p className="text-[#c9a87c]/50 text-xs font-mono tracking-widest mt-4">
          PROCESSING{dots}
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-48 mx-auto h-px bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #c9a87c, #d4a090)' }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

      </div>
    </div>
  );
}