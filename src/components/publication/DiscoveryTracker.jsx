import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

const MILESTONES = [
  { at: 10, label: 'Explorer — 10 discovered' },
  { at: 25, label: 'Quarter of the index explored' },
  { at: 50, label: 'Halfway through the Top 100' },
  { at: 75, label: 'Almost there — 75 discovered' },
  { at: 100, label: 'Full index explored' },
];

export default function DiscoveryTracker({ discoveredCount, total }) {
  const [expanded, setExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const prevCount = useRef(discoveredCount);

  // Milestone toast when crossing a threshold
  useEffect(() => {
    const hit = MILESTONES.find(m => prevCount.current < m.at && discoveredCount >= m.at);
    prevCount.current = discoveredCount;
    if (hit) {
      setToast(hit.label);
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [discoveredCount]);

  if (discoveredCount === 0) return null;
  const pct = Math.min(100, Math.round((discoveredCount / total) * 100));
  const complete = discoveredCount >= total;

  // Ring geometry
  const R = 20, C = 2 * Math.PI * R;

  return (
    <div className="fixed bottom-24 left-4 z-40 flex flex-col items-start gap-2">
      {/* Milestone toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6 }}
            className="rounded-xl px-3 py-2 shadow-xl backdrop-blur-md flex items-center gap-2"
            style={{
              background: 'rgba(15, 28, 48, 0.92)',
              border: `1px solid ${brandColors.goldPrestige}50`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: brandColors.goldPrestige }} />
            <span className="text-[11px] font-semibold text-white">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded detail card */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md"
            style={{
              background: 'rgba(15, 28, 48, 0.92)',
              border: `1px solid ${brandColors.goldPrestige}30`,
              maxWidth: 220,
            }}
          >
            <p className="text-[9px] uppercase tracking-[0.25em] mb-1.5" style={{ color: brandColors.goldPrestige }}>
              {complete ? 'Full Index Explored' : 'Honorees Discovered'}
            </p>
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: brandColors.goldPrestige }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: 'spring', damping: 25 }}
                />
              </div>
              <span className="text-[11px] font-semibold text-white whitespace-nowrap">
                {discoveredCount}/{total}
              </span>
            </div>
            {!complete && (
              <p className="text-[10px] mt-1.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {(MILESTONES.find(m => m.at > discoveredCount)?.at ?? total) - discoveredCount} more to the next milestone
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact ring badge */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setExpanded(e => !e)}
        aria-label="Discovery progress"
        className="relative w-12 h-12 rounded-full shadow-xl backdrop-blur-md flex items-center justify-center"
        style={{
          background: 'rgba(15, 28, 48, 0.92)',
          border: `1px solid ${brandColors.goldPrestige}40`,
        }}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
          <motion.circle
            cx="24" cy="24" r={R} fill="none"
            stroke={brandColors.goldPrestige} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={C}
            animate={{ strokeDashoffset: C * (1 - pct / 100) }}
            transition={{ type: 'spring', damping: 25 }}
          />
        </svg>
        <span className="text-[10px] font-bold text-white">{complete ? '★' : discoveredCount}</span>
      </motion.button>
    </div>
  );
}