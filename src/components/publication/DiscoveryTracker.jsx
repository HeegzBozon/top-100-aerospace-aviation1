import { motion, AnimatePresence } from 'framer-motion';
import { publicationBrand as brandColors } from '@/components/publication/publicationConfig';

export default function DiscoveryTracker({ discoveredCount, total }) {
  if (discoveredCount === 0) return null;
  const pct = Math.round((discoveredCount / total) * 100);
  const complete = discoveredCount >= total;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-5 left-4 z-40 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md"
        style={{
          background: 'rgba(15, 28, 48, 0.88)',
          border: `1px solid ${brandColors.goldPrestige}30`,
          maxWidth: 220,
        }}
      >
        <p
          className="text-[9px] uppercase tracking-[0.25em] mb-1.5"
          style={{ color: brandColors.goldPrestige }}
        >
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
      </motion.div>
    </AnimatePresence>
  );
}