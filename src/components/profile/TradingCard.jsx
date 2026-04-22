import { useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARD_THEMES } from './cardThemes';

function buildStats(nominee, user) {
  const stats = [];
  const metrics = nominee?.impact_metrics || {};
  if (metrics.research_publications) stats.push({ label: 'Publications', value: metrics.research_publications });
  if (metrics.citations_count) stats.push({ label: 'Citations', value: metrics.citations_count });
  if (metrics.patents_count) stats.push({ label: 'Patents', value: metrics.patents_count });
  if (metrics.missions_flown) stats.push({ label: 'Missions', value: metrics.missions_flown });
  if (metrics.flight_hours) stats.push({ label: 'Flight Hrs', value: metrics.flight_hours });
  const customStats = user?.custom_card_stats || [];
  customStats.forEach(s => { if (s.value > 0) stats.push({ label: s.label, value: s.value }); });
  return stats;
}

function AnimatedValue({ value }) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (prevRef.current !== value) {
      setFlash(true);
      prevRef.current = value;
      const t = setTimeout(() => setFlash(false), 800);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span className="relative inline-block">
      {flash && (
        <motion.span
          className="absolute inset-0 rounded"
          initial={{ opacity: 0.7, scale: 1.3 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.8 }}
          style={{ background: 'rgba(201,168,124,0.4)', filter: 'blur(6px)' }}
        />
      )}
      <motion.span
        key={value}
        initial={{ scale: 1.2, color: '#c9a87c' }}
        animate={{ scale: 1, color: '#ffffff' }}
        transition={{ duration: 0.5 }}
      >
        {(value || 0).toLocaleString()}
      </motion.span>
    </span>
  );
}

export default function TradingCard({ user, nominee, cardRef, themeId }) {
  const theme = CARD_THEMES[themeId || user?.card_theme || 'navy'] || CARD_THEMES.navy;

  const displayName = user?.full_name || 'Anonymous';
  const displayRole = user?.headline || user?.industry_role || nominee?.title || nominee?.professional_role || '';
  const displayCompany = nominee?.company || nominee?.organization || '';
  const avatar = user?.avatar_url || nominee?.avatar_url || nominee?.photo_url;
  const location = user?.location || nominee?.country || '';
  const tags = user?.expertise_tags?.slice(0, 3) || [];
  const sixWord = nominee?.six_word_story;
  const stats = buildStats(nominee, user);
  const displayStats = stats.slice(0, 6);
  const cols = displayStats.length <= 3 ? Math.max(displayStats.length, 1) : displayStats.length <= 4 ? 4 : 3;

  return (
    <div
      ref={cardRef}
      className="relative w-[360px] rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: theme.bg }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: `radial-gradient(circle at top right, ${theme.cornerGlow1}, transparent 70%)` }} />
      <div className="absolute bottom-0 left-0 w-40 h-40 opacity-10" style={{ background: `radial-gradient(circle at bottom left, ${theme.cornerGlow2}, transparent 70%)` }} />
      <div className="h-1" style={{ background: theme.borderTop }} />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-5">
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: theme.accent }}>
            TOP 100 Aerospace & Aviation
          </span>
          {nominee && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold" style={{ background: `${theme.accent}25`, color: theme.accent }}>
              <Trophy className="w-2.5 h-2.5" /> NOMINEE
            </div>
          )}
        </div>

        <div className="flex items-start gap-4 mb-5">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0" style={{ borderColor: `${theme.accent}40` }}>
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ background: `${theme.accent}15`, color: theme.accent }}>
                {displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold leading-tight mb-1" style={{ color: theme.textPrimary, fontFamily: "'Playfair Display', serif" }}>
              {displayName}
            </h2>
            {displayRole && <p className="text-sm mb-0.5" style={{ color: theme.textSecondary }}>{displayRole}</p>}
            {displayCompany && <p className="text-xs" style={{ color: theme.textMuted }}>{displayCompany}</p>}
            {location && <p className="text-[11px] mt-1" style={{ color: theme.textMuted }}>📍 {location}</p>}
          </div>
        </div>

        {sixWord && (
          <div className="mb-5 px-4 py-3 rounded-xl" style={{ background: theme.quoteBg, borderLeft: `3px solid ${theme.quoteBorder}` }}>
            <p className="text-sm italic leading-relaxed" style={{ color: theme.textSecondary, fontFamily: "'Playfair Display', serif" }}>
              "{sixWord}"
            </p>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-medium" style={{ background: theme.tagBg, color: theme.textSecondary }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <AnimatePresence>
          {displayStats.length > 0 && (
            <motion.div
              className="grid gap-2 mb-4"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
              layout
            >
              {displayStats.map(stat => (
                <motion.div
                  key={stat.label}
                  layout
                  className="text-center px-2 py-2 rounded-lg"
                  style={{ background: theme.statBg }}
                >
                  <div className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                    <AnimatedValue value={stat.value} />
                  </div>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: theme.textMuted }}>{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: theme.footerBorder }}>
          <span className="text-[9px] tracking-wider" style={{ color: theme.textMuted }}>top100aero.space</span>
          <span className="text-[9px]" style={{ color: theme.textMuted }}>2026</span>
        </div>
      </div>
    </div>
  );
}