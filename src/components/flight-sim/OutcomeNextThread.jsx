import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { RotateCcw, Users, ChevronRight, Flame, Trophy, TrendingUp, Shield } from 'lucide-react';

const OUTCOME_CONFIG = {
  critical_fail: {
    label: 'FLAME-OUT',
    headline: "Every great director has a flame-out in the file.",
    sub: "The debrief is where you get better. Run it again — different choices, different outcome.",
    color: '#e8614a',
    glowColor: 'rgba(232,97,74,0.15)',
    borderColor: 'rgba(232,97,74,0.3)',
    icon: Flame,
    primaryCTA: { label: 'Fly Again — Same Campaign', action: 'replay' },
    secondaryCTA: { label: 'Try the Other Campaign', action: 'other' },
    communityLine: "See how others handled the same boss moment.",
  },
  fail: {
    label: 'NO-GO',
    headline: "You held the line. Not every call goes the way you planned.",
    sub: "The mission continues. Run the other campaign and see if your profile shifts.",
    color: '#7b9ec9',
    glowColor: 'rgba(123,158,201,0.12)',
    borderColor: 'rgba(123,158,201,0.25)',
    icon: Shield,
    primaryCTA: { label: 'Try the Other Campaign', action: 'other' },
    secondaryCTA: { label: 'Fly Again', action: 'replay' },
    communityLine: "See how other pilots scored on this mission.",
  },
  success: {
    label: 'MISSION COMPLETE',
    headline: "Solid execution. Now see how you stack up.",
    sub: "Your Flight Profile is live. The community is watching the leaderboard.",
    color: '#c9a87c',
    glowColor: 'rgba(201,168,124,0.12)',
    borderColor: 'rgba(201,168,124,0.25)',
    icon: TrendingUp,
    primaryCTA: { label: 'See the Standings', action: 'standings' },
    secondaryCTA: { label: 'Fly the Other Campaign', action: 'other' },
    communityLine: "Your profile joins 100+ aerospace professionals in the index.",
  },
  critical_success: {
    label: 'CRITICAL SUCCESS',
    headline: "That's a rare result. The room remembers calls like that.",
    sub: "Your profile is in the top tier. See where you land in the Season 4 index.",
    color: '#9dc97c',
    glowColor: 'rgba(157,201,124,0.12)',
    borderColor: 'rgba(157,201,124,0.3)',
    icon: Trophy,
    primaryCTA: { label: 'Nominate for Season 4', action: 'nominate' },
    secondaryCTA: { label: 'Fly the Other Campaign', action: 'other' },
    communityLine: "Critical success profiles are fast-tracked for Season 4 review.",
  },
};

const ACTION_LINKS = {
  standings: '/Top100Women2025',
  nominate: '/nominate',
};

export default function OutcomeNextThread({ diceResult, session, onPlayAgain, onPlayOther }) {
  const outcome = diceResult?.outcome || 'success';
  const config = OUTCOME_CONFIG[outcome] || OUTCOME_CONFIG.success;
  const Icon = config.icon;

  const isCampaign01 = session?.campaignId === 'C-01';

  const handleCTA = (action) => {
    if (action === 'replay') return onPlayAgain();
    if (action === 'other') return onPlayOther(isCampaign01 ? 'C-02' : 'C-01');
    if (action === 'nominate') return window.location.href = '/nominate';
    if (action === 'standings') return window.location.href = '/Top100Women2025';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      className="rounded-2xl p-6 md:p-8 border mb-6"
      style={{ background: config.glowColor, borderColor: config.borderColor }}
    >
      {/* Outcome badge */}
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" style={{ color: config.color }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>

      <h3 className="text-white font-bold text-lg mb-2 leading-snug"
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        {config.headline}
      </h3>
      <p className="text-white/45 text-sm mb-6 leading-relaxed">{config.sub}</p>

      {/* Primary + secondary CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <button
          onClick={() => handleCTA(config.primaryCTA.action)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.99]"
          style={{ background: config.color, color: '#07111f' }}
        >
          {config.primaryCTA.label} <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleCTA(config.secondaryCTA.action)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all hover:border-white/30 text-white/60 hover:text-white"
          style={{ borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
        >
          {config.secondaryCTA.label}
        </button>
      </div>

      {/* Community thread */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/8">
        <Users className="w-3.5 h-3.5 text-white/25" />
        <span className="text-white/30 text-xs">{config.communityLine}</span>
        <Link to="/Top100Women2025" className="text-xs ml-auto text-white/35 hover:text-white/60 transition-colors flex items-center gap-1">
          Index <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}