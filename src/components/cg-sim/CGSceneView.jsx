import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const STAT_LABELS = { coalition: 'COALITION', trust: 'TRUST', resource: 'RESOURCE', resilience: 'RESILIENCE', narrative: 'NARRATIVE', systems: 'SYSTEMS' };

const OUTCOME_COLORS = {
  critical_success: 'text-emerald-400',
  success: 'text-[#4ade80]',
  fail: 'text-orange-400',
  critical_fail: 'text-red-400',
};

const OUTCOME_LABELS = {
  critical_success: 'Critical Success',
  success: 'Motion Carries',
  fail: 'Motion Fails',
  critical_fail: 'Tabled',
};

export default function CGSceneView({ scene, session, aiContent, onChoice, onEpilogue, isEpilogue, diceResult }) {
  const [chosen, setChosen] = useState(null);
  const displayText = aiContent || scene.text || '';
  const beatIndex = session?.campaign?.scenes?.findIndex(s => s.id === scene.id) ?? 0;
  const totalScenes = session?.campaign?.scenes?.filter(s => s.type !== 'signal_log').length ?? 7;
  const progress = Math.round(((beatIndex + 1) / totalScenes) * 100);

  const handleChoice = (choice) => {
    setChosen(choice.key);
    setTimeout(() => {
      setChosen(null);
      onChoice(scene, choice.key, choice.statDeltas);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#4ade80] text-xs font-bold uppercase tracking-widest">{scene.beat}</span>
            <span className="text-white/30 text-xs">{scene.title}</span>
          </div>
          <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #4ade80, #22c55e)' }} />
          </div>
        </div>

        {/* Dice result banner */}
        {diceResult && scene.type !== 'boss' && beatIndex > (session?.campaign?.scenes?.findIndex(s => s.type === 'boss') ?? 99) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl px-5 py-3 border border-white/10 flex items-center gap-4"
            style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-center">
              <div className="text-white/30 text-[10px] uppercase tracking-widest">Roll</div>
              <div className="text-2xl font-bold text-white font-mono">{diceResult.total}</div>
            </div>
            <div>
              <div className={`font-bold text-sm ${OUTCOME_COLORS[diceResult.outcome]}`}>{OUTCOME_LABELS[diceResult.outcome]}</div>
              <div className="text-white/30 text-xs">d20({diceResult.diceResult}) + {diceResult.modifier} modifier</div>
            </div>
          </motion.div>
        )}

        {/* Title */}
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
          {scene.title}
        </motion.h2>

        {/* Text */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-10">
          <div className="space-y-4">
            {displayText.split('\n\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-white/70 text-base leading-relaxed">{para}</p>
            ))}
          </div>
        </motion.div>

        {/* Choices */}
        {!isEpilogue && scene.choices?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="space-y-3">
            {scene.choices.map((choice, i) => (
              <button key={choice.key} onClick={() => handleChoice(choice)}
                className={`w-full text-left rounded-2xl p-6 border transition-all duration-200 group ${
                  chosen === choice.key ? 'border-[#4ade80] scale-[0.98]' : 'border-white/8 hover:border-[#4ade80]/50'
                }`}
                style={{ background: chosen === choice.key ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.025)' }}>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <p className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors">{choice.label}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Boss aftermath continue */}
        {!isEpilogue && scene.type === 'boss' && !scene.choices?.length && displayText && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center">
            <button onClick={() => onChoice(scene, 'continue', null)}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
              Read the Outcome
            </button>
          </motion.div>
        )}

        {/* Epilogue CTA */}
        {isEpilogue && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center">
            <button onClick={onEpilogue}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-sm transition-all shadow-[0_0_35px_rgba(74,222,128,0.35)]"
              style={{ background: 'linear-gradient(135deg, #4ade80, #22c55e)', color: '#03080f' }}>
              Reveal Your Civic Profile
            </button>
          </motion.div>
        )}

        {/* Stats */}
        {session?.stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-12 pt-8 border-t border-white/5">
            <p className="text-white/25 text-xs uppercase tracking-widest mb-4 text-center">Current Stats</p>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              {Object.entries(session.stats).map(([stat, val]) => (
                <div key={stat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-white/30 text-[10px] uppercase tracking-widest">{STAT_LABELS[stat]}</span>
                    <span className="text-[#4ade80] text-[10px] font-bold">{val}</span>
                  </div>
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#4ade80]" style={{ width: `${(val / 20) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}