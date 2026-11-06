import { motion } from 'framer-motion';
import { brand, ink } from './NominateConfig';

/**
 * Strong section header that makes each category feel like its own distinct stage.
 * Shows: stage indicator (X of 4), big category badge, title, intro.
 */
const NAV_ITEMS = [
  { n: 1, label: 'Women' },
  { n: 2, label: 'Men' },
  { n: 3, label: 'Angels' },
  { n: 4, label: 'Local Legends' },
];

export default function CategoryHeader({ stageNumber, categoryLabel, accentColor, title, intro, icon: Icon, onNavigate, counts = {} }) {
  const accent = accentColor || brand.gold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative pb-2"
    >
      {/* Multi-category hint */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: `${brand.gold}20` }}>
          <span className="text-[10px]" style={{ color: ink.label }}>✦</span>
        </div>
        <p className="text-[11px] font-semibold leading-tight" style={{ color: ink.body }}>
          Nominate across <span style={{ color: brand.navy }}>all four categories</span> — jump to any anytime.
        </p>
      </div>

      {/* Clickable category menu */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {NAV_ITEMS.map(item => {
          const isActive = item.n === stageNumber;
          const isPast = item.n < stageNumber;
          const count = counts[item.n] || 0;
          return (
            <button
              key={item.n}
              onClick={() => onNavigate?.(item.n)}
              className="relative flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
              style={{
                // The chosen category is a navy plate with cream type. White on the rose
                // accent read at 2.7:1 — light on light — and white on rose gold at 2.1:1,
                // so the plate is navy whatever the category is, and the accent carries the
                // identity in the dot under the title and the label beside it instead.
                background: isActive ? brand.navy : isPast ? `${brand.navy}08` : 'white',
                color: isActive ? brand.cream : isPast ? brand.navy : ink.soft,
                border: `2px solid ${isActive ? brand.navy : isPast ? `${brand.navy}25` : `${brand.navy}12`}`,
                boxShadow: isActive ? '0 6px 20px rgb(var(--editorial-navy-rgb) / 0.28)' : 'none',
              }}
            >
              {count > 0 && (
                <span
                  className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    // The count reads as navy on rose gold (5.2:1). It was white on the same
                    // gold before, at 2.1:1, and the accent on white when the chip was lit.
                    background: brand.gold,
                    color: brand.navy,
                    border: `1.5px solid ${isActive ? brand.cream : 'white'}`,
                  }}
                >
                  {count}
                </span>
              )}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Big category badge */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
          style={{ background: brand.navy }}
        >
          {/* A navy plate with a cream mark: the same plate the count and the chip use, so
              no category's mark is ever printed light on a light ground. */}
          {Icon && <Icon className="w-6 h-6" style={{ color: brand.cream }} />}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: ink.label }}>
            Category {stageNumber} of 4
          </div>
          <div className="text-base font-bold tracking-wide" style={{ color: brand.navy }}>
            {categoryLabel}
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
        {title}
      </h1>

      {/* Intro */}
      <p className="text-sm sm:text-base leading-relaxed" style={{ color: ink.body }}>
        {intro}
      </p>

      {/* Decorative divider */}
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: `${brand.navy}15` }} />
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        <div className="h-px flex-1" style={{ background: `${brand.navy}15` }} />
      </div>
    </motion.div>
  );
}