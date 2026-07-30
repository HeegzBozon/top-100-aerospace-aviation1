import { motion, AnimatePresence } from 'framer-motion';
import { PieChart as PieChartIcon, TrendingUp, Sparkles } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

const CATEGORY_COLORS = {
  women: brand.gold,
  men: brand.navy,
  angels: '#cd7f32',
  local: '#8b9dc3',
  general: '#a08060',
  Engineering: brand.navy,
  Business: brand.gold,
  Science: '#5a8d6e',
  Operations: '#8b9dc3',
};

function resolveCategoryColor(cat) {
  const key = (cat || 'general').toLowerCase();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.general;
}

export default function ListImpactBar({ rankings }) {
  const total = rankings.length;
  const goal = 100;
  const pct = Math.min(100, Math.round((total / goal) * 100));

  // Category breakdown
  const catCounts = {};
  rankings.forEach(r => {
    const c = r.category || 'general';
    catCounts[c] = (catCounts[c] || 0) + 1;
  });
  const cats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

  // Milestone nudge
  let nudge = null;
  if (total === 0) {
    nudge = { text: 'Start by adding your first nominee', icon: Sparkles };
  } else if (total < 10) {
    nudge = { text: `${10 - total} more to reach your first 10`, icon: TrendingUp };
  } else if (total < 25) {
    nudge = { text: `${25 - total} more to hit 25 — great momentum`, icon: TrendingUp };
  } else if (total < 50) {
    nudge = { text: `${50 - total} more to reach the half-century`, icon: TrendingUp };
  } else if (total < 100) {
    nudge = { text: `${100 - total} more to complete your Top 100`, icon: TrendingUp };
  } else {
    nudge = { text: 'Your Top 100 is complete — publish to make it official', icon: Sparkles };
  }

  const NudgeIcon = nudge.icon;

  return (
    <div className="mx-4 mt-3 mb-2 rounded-3xl overflow-hidden border" style={{ background: 'white', borderColor: `${brand.navy}10` }}>
      {/* Progress header */}
      <div className="px-4 pt-3.5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-3.5 h-3.5" style={{ color: brand.gold }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: `${brand.navy}70` }}>
              Your Curation
            </span>
          </div>
          <span className="text-xs font-bold" style={{ color: brand.navy }}>{total}/{goal}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: `${brand.navy}08` }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${brand.navy}, ${brand.gold})` }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Milestone nudge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={nudge.text}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 mt-2.5"
          >
            <NudgeIcon className="w-3 h-3 shrink-0" style={{ color: brand.gold }} />
            <p className="text-[11px] font-medium leading-tight" style={{ color: `${brand.navy}70` }}>
              {nudge.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Category breakdown (only when there's data) */}
      {cats.length > 0 && (
        <div className="px-4 pb-3.5 pt-1 border-t" style={{ borderColor: `${brand.navy}06` }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: `${brand.navy}50` }}>
            Category Breakdown
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cats.map(([cat, count]) => (
              <div
                key={cat}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: `${resolveCategoryColor(cat)}12`, color: resolveCategoryColor(cat) }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: resolveCategoryColor(cat) }} />
                <span className="capitalize">{cat}</span>
                <span style={{ opacity: 0.6 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}