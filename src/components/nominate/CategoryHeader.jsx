import { motion } from 'framer-motion';
import { brand } from './NominateConfig';

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

export default function CategoryHeader({ stageNumber, categoryLabel, accentColor, title, intro, icon: Icon, onNavigate }) {
  const accent = accentColor || brand.gold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative pb-2"
    >
      {/* Clickable category menu */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {NAV_ITEMS.map(item => {
          const isActive = item.n === stageNumber;
          const isPast = item.n < stageNumber;
          return (
            <button
              key={item.n}
              onClick={() => onNavigate?.(item.n)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0"
              style={{
                background: isActive ? accent : isPast ? `${brand.navy}10` : 'transparent',
                color: isActive ? '#fff' : isPast ? brand.navy : `${brand.navy}55`,
                border: `1px solid ${isActive ? accent : isPast ? `${brand.navy}20` : `${brand.navy}15`}`,
              }}
            >
              {isPast && <span className="w-1.5 h-1.5 rounded-full" style={{ background: brand.navy }} />}
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Big category badge */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        >
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: `${brand.navy}50` }}>
            Category {stageNumber} of 4
          </div>
          <div className="text-base font-bold tracking-wide" style={{ color: accent }}>
            {categoryLabel}
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-4" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
        {title}
      </h1>

      {/* Intro */}
      <p className="text-sm sm:text-base leading-relaxed" style={{ color: `${brand.navy}80` }}>
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