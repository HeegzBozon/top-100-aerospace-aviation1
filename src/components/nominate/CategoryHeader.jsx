import { motion } from 'framer-motion';
import { brand } from './NominateConfig';

/**
 * Strong section header that makes each category feel like its own distinct stage.
 * Shows: stage indicator (X of 4), big category badge, title, intro.
 */
export default function CategoryHeader({ stageNumber, categoryLabel, accentColor, title, intro, icon: Icon }) {
  const accent = accentColor || brand.gold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative pb-2"
    >
      {/* Stage progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map(n => (
          <div
            key={n}
            className="h-1 flex-1 rounded-full transition-all"
            style={{
              background: n < stageNumber ? brand.navy : n === stageNumber ? accent : `${brand.navy}15`,
            }}
          />
        ))}
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
            Stage {stageNumber} of 4
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