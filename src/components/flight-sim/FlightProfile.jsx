import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Share2, RotateCcw, ChevronRight } from 'lucide-react';
import RadarChart from './RadarChart';
import GameEngine from './GameEngine';
import FlightDebrief from './FlightDebrief';

const OUTCOME_LABELS = {
  critical_success: 'Critical Success',
  success: 'Success',
  fail: 'Fail',
  critical_fail: 'Critical Fail',
};

const ROLE_LABELS = {
  fellow: 'Potential Fellow',
  booster: 'Community Booster',
  investor: 'Potential Investor',
  partner: 'Strategic Partner',
};

const STAT_LABELS = { altitude: 'ALTITUDE', velocity: 'VELOCITY', payload: 'PAYLOAD', range: 'RANGE', resilience: 'RESILIENCE', maneuver: 'MANEUVER' };

export default function FlightProfile({ profile, session, playerInfo, onPlayAgain, diceResult }) {
  const { classification, quote, ecosystemRole, cta, ctaLink } = profile;
  const isExternal = ctaLink?.startsWith('http');

  useEffect(() => {
    // Non-blocking session save
    if (session && playerInfo) {
      GameEngine.saveSession(session, playerInfo, profile, session.diceResult).catch(() => {});
    }
  }, []);

  const handleShare = () => {
    const text = `I just ran Campaign C-01: The Right Stuff on Flight Simulator by TOP 100 Aerospace & Aviation.\n\nFlight Profile: ${classification}\n\n"${quote}"\n\ntop100aero.space/play`;
    if (navigator.share) {
      navigator.share({ title: `Flight Profile: ${classification}`, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      alert('Profile copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-15 blur-[160px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #c9a87c 0%, transparent 70%)' }} />

      <div className="w-full max-w-2xl relative z-10">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-center mb-10">
          <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">Mission Complete</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl md:text-5xl font-bold text-white mb-3">Flight Profile</h2>
          <p className="text-white/40 text-sm">Class of 2026 · Campaign C-01: The Right Stuff</p>
        </motion.div>

        {/* Profile card */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="rounded-3xl border border-[#c9a87c]/30 p-8 md:p-10 mb-6"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,124,0.08), rgba(7,17,31,0.95))' }}>

          {/* Classification */}
          <div className="text-center mb-8">
            <div className="inline-block px-5 py-2 rounded-full border border-[#c9a87c]/40 mb-4"
              style={{ background: 'rgba(201,168,124,0.1)' }}>
              <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">{ROLE_LABELS[ecosystemRole]}</p>
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-4xl font-bold text-white mb-4">{classification}</h3>
            <p className="text-white/60 text-base italic max-w-md mx-auto">"{quote}"</p>
          </div>

          {/* Radar + stats */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="flex-shrink-0">
              <RadarChart stats={session.stats} />
            </div>
            <div className="flex-1 w-full space-y-3">
              {Object.entries(session.stats).map(([stat, val]) => (
                <div key={stat} className="flex items-center gap-3">
                  <span className="text-white/40 text-xs uppercase tracking-widest w-20 flex-shrink-0">{STAT_LABELS[stat]}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(val / 20) * 100}%` }}
                      transition={{ delay: 0.4 + Object.keys(session.stats).indexOf(stat) * 0.06, duration: 0.6 }}
                      className="h-full rounded-full bg-[#c9a87c]" />
                  </div>
                  <span className="text-[#c9a87c] font-bold text-sm w-6 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Boss roll result */}
          {session.choices?.length > 0 && (
            <div className="rounded-xl p-4 border border-white/8 text-center"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Boss Moment Roll</p>
              <p className="text-white/70 text-sm">
                {session.choices.find(c => c.sceneId === 'boss') ? 'Roll executed' : 'Completed'}
              </p>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-2xl p-6 border border-[#c9a87c]/20 mb-6 text-center"
          style={{ background: 'rgba(201,168,124,0.05)' }}>
          <p className="text-white/50 text-sm mb-4">Based on your Flight Profile, your next move:</p>
          {isExternal ? (
            <a href={ctaLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_25px_rgba(201,168,124,0.3)]">
              {cta} <ChevronRight className="w-4 h-4" />
            </a>
          ) : (
            <Link to={ctaLink}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_25px_rgba(201,168,124,0.3)]">
              {cta} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>

        {/* Flight Debrief upgrade */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
          className="rounded-3xl p-6 md:p-8 border border-white/8 mb-6"
          style={{ background: 'rgba(255,255,255,0.02)' }}>
          <FlightDebrief profile={profile} session={session} playerInfo={playerInfo} />
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleShare}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#c9a87c]/50 transition-all text-sm font-semibold">
            <Share2 className="w-4 h-4" /> Share Flight Profile
          </button>
          <button onClick={onPlayAgain}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-[#c9a87c]/50 transition-all text-sm font-semibold">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </motion.div>

        <p className="text-center text-white/20 text-xs mt-8 italic"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          Top 100 Aerospace & Aviation · Est. 2021 · Ad Astra.
        </p>
      </div>
    </div>
  );
}