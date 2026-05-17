import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const STAT_LABELS = { coalition: 'COALITION', trust: 'TRUST', resource: 'RESOURCE', resilience: 'RESILIENCE', narrative: 'NARRATIVE', systems: 'SYSTEMS' };

const OUTCOME_STYLES = {
  critical_success: { label: 'Motion Carries — Unanimous', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.35)' },
  success:         { label: 'Motion Carries', color: '#86efac', bg: 'rgba(134,239,172,0.1)', border: 'rgba(134,239,172,0.25)' },
  fail:            { label: 'Motion Fails', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)' },
  critical_fail:   { label: 'Tabled — Session Closed', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
};

function calcModifier(stats, rollStats) {
  const avg = rollStats.reduce((sum, s) => sum + (stats[s] || 10), 0) / rollStats.length;
  return Math.floor((avg - 10) / 2);
}

function calcOutcome(total) {
  if (total >= 18) return 'critical_success';
  if (total >= 12) return 'success';
  if (total >= 6)  return 'fail';
  return 'critical_fail';
}

export default function CGDiceRoll({ scene, session, onComplete }) {
  const [rollState, setRollState] = useState('setup'); // setup | rolling | reveal
  const [result, setResult] = useState(null);
  const modifier = calcModifier(session.stats, scene.rollStats || ['coalition', 'trust']);

  const roll = () => {
    setRollState('rolling');
    setTimeout(() => {
      const diceResult = Math.floor(Math.random() * 20) + 1;
      const total = Math.max(1, diceResult + modifier);
      const outcome = calcOutcome(total);
      const r = { diceResult, modifier, total, outcome };
      setResult(r);
      setRollState('reveal');
    }, 1400);
  };

  const style = result ? OUTCOME_STYLES[result.outcome] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="text-[#4ade80] text-xs font-bold uppercase tracking-widest mb-2">{scene.beat}</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl font-bold text-white mb-4">{scene.title}</h2>
        </motion.div>

        {/* Boss setup text */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-7 border border-white/8 mb-8"
          style={{ background: 'rgba(255,255,255,0.025)' }}>
          {scene.setup.split('\n\n').map((para, i) => (
            <p key={i} className="text-white/65 text-sm leading-relaxed mb-3 last:mb-0">{para}</p>
          ))}
        </motion.div>

        {/* Modifiers */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="rounded-xl p-4 border border-[#4ade80]/15 mb-8 flex items-center justify-between"
          style={{ background: 'rgba(74,222,128,0.04)' }}>
          <span className="text-white/40 text-xs uppercase tracking-widest">{scene.rollLabel}</span>
          <span className="text-[#4ade80] font-bold text-sm">{modifier >= 0 ? '+' : ''}{modifier} modifier</span>
        </motion.div>

        {/* Die */}
        <div className="flex justify-center mb-8">
          <AnimatePresence mode="wait">
            {rollState === 'setup' && (
              <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-28 h-28 rounded-2xl border-2 border-[#4ade80]/30 flex items-center justify-center text-4xl"
                style={{ background: 'rgba(74,222,128,0.06)' }}>
                <span className="text-white/20 font-mono text-2xl">d20</span>
              </motion.div>
            )}
            {rollState === 'rolling' && (
              <motion.div key="rolling"
                animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0], scale: [1, 1.05, 0.98, 1.03, 0.99, 1] }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="w-28 h-28 rounded-2xl border-2 border-[#4ade80]/50 flex items-center justify-center text-4xl"
                style={{ background: 'rgba(74,222,128,0.1)' }}>
                <span className="font-mono text-3xl text-[#4ade80]">?</span>
              </motion.div>
            )}
            {rollState === 'reveal' && result && (
              <motion.div key="reveal"
                initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}
                className="w-28 h-28 rounded-2xl border-2 flex items-center justify-center"
                style={{ borderColor: style.border, background: style.bg }}>
                <span className="font-mono text-5xl font-bold" style={{ color: style.color }}>{result.diceResult}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reveal outcome */}
        <AnimatePresence>
          {rollState === 'reveal' && result && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 border text-center mb-6"
              style={{ background: style.bg, borderColor: style.border }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: style.color }}>
                {style.label}
              </p>
              <p className="font-mono text-4xl font-bold text-white mb-1">{result.total}</p>
              <p className="text-white/30 text-xs">d20({result.diceResult}) + {result.modifier} modifier</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        {rollState === 'setup' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center">
            <button onClick={roll}
              className="px-10 py-4 rounded-full font-bold text-sm shadow-[0_0_30px_rgba(74,222,128,0.3)] transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
              Call the Vote
            </button>
          </motion.div>
        )}

        {rollState === 'reveal' && result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
            <button onClick={() => onComplete(result)}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
              See What Happened <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}