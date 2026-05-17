import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameEngine from './GameEngine';

const OUTCOME_STYLES = {
  critical_success: { color: '#34d399', label: 'Critical Success', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.4)' },
  success: { color: '#c9a87c', label: 'Success', bg: 'rgba(201,168,124,0.1)', border: 'rgba(201,168,124,0.4)' },
  fail: { color: '#fb923c', label: 'Fail', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.4)' },
  critical_fail: { color: '#f87171', label: 'Critical Fail', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.4)' },
};

const STAT_LABELS = { altitude: 'ALTITUDE', velocity: 'VELOCITY', payload: 'PAYLOAD', range: 'RANGE', resilience: 'RESILIENCE', maneuver: 'MANEUVER' };

export default function DiceRoll({ scene, session, onComplete }) {
  const [phase, setPhase] = useState('setup'); // setup | rolling | reveal
  const [rollingNum, setRollingNum] = useState(1);
  const [result, setResult] = useState(null);

  const rollStats = scene.rollStats || [];
  const s = session.stats;
  const primaryStat = rollStats[0] ? s[rollStats[0]] || 10 : 10;
  const secondaryStat = rollStats[1] ? s[rollStats[1]] || 10 : 10;
  const avgStat = Math.round((primaryStat + secondaryStat) / 2);
  const modifier = Math.floor((avgStat - 10) / 2);

  const handleRoll = () => {
    setPhase('rolling');
    const rollData = GameEngine.executeDiceRoll(session, scene);
    setResult(rollData);

    let ticks = 0;
    const interval = setInterval(() => {
      setRollingNum(Math.floor(Math.random() * 20) + 1);
      ticks++;
      if (ticks > 20) {
        clearInterval(interval);
        setRollingNum(rollData.diceResult);
        setTimeout(() => setPhase('reveal'), 600);
      }
    }, 60);
  };

  const outcomeStyle = result ? OUTCOME_STYLES[result.outcome] : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">

        <div className="text-center mb-8">
          <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest mb-2">{scene.beat}</p>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-3xl md:text-4xl font-bold text-white mb-6">{scene.title}</h2>
        </div>

        {/* Setup text */}
        {scene.setup && (
          <div className="mb-10 space-y-4">
            {scene.setup.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-white/70 text-base leading-relaxed">{para}</p>
            ))}
          </div>
        )}

        {/* Stat modifier info */}
        <div className="rounded-2xl p-6 border border-white/10 mb-8"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4 text-center">{scene.rollLabel}</p>
          <div className="flex items-center justify-center gap-6">
            {rollStats.map(stat => (
              <div key={stat} className="text-center">
                <div className="text-[#c9a87c] font-bold text-lg">{session.stats[stat] || 10}</div>
                <div className="text-white/40 text-xs uppercase tracking-wide">{STAT_LABELS[stat] || stat}</div>
              </div>
            ))}
            {rollStats.length > 1 && (
              <>
                <div className="text-white/30 text-lg font-bold">→</div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{modifier >= 0 ? `+${modifier}` : modifier}</div>
                  <div className="text-white/40 text-xs uppercase tracking-wide">Modifier</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* The Dice */}
        <div className="flex flex-col items-center mb-10">
          <AnimatePresence mode="wait">
            {phase === 'setup' && (
              <motion.div key="setup-die" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="w-32 h-32 rounded-2xl border-2 border-[#c9a87c]/30 flex items-center justify-center mb-6 cursor-pointer"
                style={{ background: 'rgba(201,168,124,0.05)' }}>
                <span className="text-6xl text-white/20 font-bold select-none">d20</span>
              </motion.div>
            )}

            {phase === 'rolling' && (
              <motion.div key="rolling-die" animate={{ rotate: [0, 15, -15, 10, -10, 5, -5, 0], scale: [1, 1.1, 0.95, 1.05, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-32 h-32 rounded-2xl border-2 border-[#c9a87c] flex items-center justify-center mb-6"
                style={{ background: 'rgba(201,168,124,0.12)' }}>
                <span className="text-5xl font-bold text-[#c9a87c] font-mono">{rollingNum}</span>
              </motion.div>
            )}

            {phase === 'reveal' && result && (
              <motion.div key="reveal-die" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-32 h-32 rounded-2xl border-2 flex items-center justify-center mb-6"
                style={{ background: outcomeStyle.bg, borderColor: outcomeStyle.border }}>
                <span className="text-5xl font-bold font-mono" style={{ color: outcomeStyle.color }}>{result.diceResult}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {phase === 'reveal' && result && outcomeStyle && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
              <div className="text-white/50 text-sm mb-1">
                {result.diceResult} + {result.modifier} modifier = <span className="font-bold text-white">{result.total}</span>
              </div>
              <div className="inline-block px-5 py-2 rounded-full border font-bold text-base"
                style={{ color: outcomeStyle.color, background: outcomeStyle.bg, borderColor: outcomeStyle.border }}>
                {outcomeStyle.label}
              </div>
              <div className="text-white/30 text-xs mt-2">
                {result.outcome === 'critical_success' && '17–20+ · Breakthrough outcome'}
                {result.outcome === 'success' && '11–16 · Clean resolution'}
                {result.outcome === 'fail' && '6–10 · Consequence, path continues'}
                {result.outcome === 'critical_fail' && '1–5 · Significant consequence'}
              </div>
            </motion.div>
          )}

          {phase === 'setup' && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={handleRoll}
              className="px-10 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_35px_rgba(201,168,124,0.4)]">
              Roll the Dice
            </motion.button>
          )}

          {phase === 'reveal' && result && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => onComplete(result)}
              className="px-10 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_35px_rgba(201,168,124,0.4)]">
              Continue
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}