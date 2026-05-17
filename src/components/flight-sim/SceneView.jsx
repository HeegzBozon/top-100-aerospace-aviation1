import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import StatBar from './StatBar';

const OUTCOME_COLORS = {
  critical_success: 'text-emerald-400',
  success: 'text-[#c9a87c]',
  fail: 'text-orange-400',
  critical_fail: 'text-red-400',
};

const OUTCOME_LABELS = {
  critical_success: 'Critical Success',
  success: 'Success',
  fail: 'Fail',
  critical_fail: 'Critical Fail',
};

export default function SceneView({ scene, session, aiContent, loadingAI, onChoice, onEpilogue, isEpilogue, diceResult }) {
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

        {/* Progress + Beat */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">{scene.beat}</span>
            <span className="text-white/30 text-xs">{scene.title}</span>
          </div>
          <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #c9a87c, #d4a090)' }} />
          </div>
        </div>

        {/* Dice result banner (shown after boss moment) */}
        {diceResult && scene.type !== 'boss' && beatIndex > session?.campaign?.scenes?.findIndex(s => s.type === 'boss') && (
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

        {/* Scene title */}
        <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-3xl md:text-4xl font-bold text-white mb-8 leading-snug">
          {scene.title}
        </motion.h2>

        {/* Scene text */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-10">
          {loadingAI ? (
            <div className="flex items-center gap-3 py-12 text-white/40">
              <Loader2 className="w-5 h-5 animate-spin text-[#c9a87c]" />
              <span className="text-sm italic">Processing telemetry...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {displayText.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i} className="text-white/70 text-base leading-relaxed">{para}</p>
              ))}
            </div>
          )}
        </motion.div>

        {/* Choices or epilogue CTA */}
        {!loadingAI && !isEpilogue && scene.choices?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="space-y-3">
            {scene.choices.map((choice, i) => (
              <button key={choice.key}
                onClick={() => handleChoice(choice)}
                className={`w-full text-left rounded-2xl p-6 border transition-all duration-200 group ${
                  chosen === choice.key ? 'border-[#c9a87c] scale-[0.98]' : 'border-white/8 hover:border-[#c9a87c]/50'
                }`}
                style={{ background: chosen === choice.key ? 'rgba(201,168,124,0.12)' : 'rgba(255,255,255,0.025)' }}>
                <div className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(201,168,124,0.15)', color: '#c9a87c' }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <p className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors">{choice.label}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {/* Boss aftermath — no choices, not epilogue: show continue to advance to epilogue */}
        {!loadingAI && !isEpilogue && scene.type === 'boss' && !scene.choices?.length && displayText && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-center">
            <button onClick={() => onChoice(scene, 'continue', null)}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_35px_rgba(201,168,124,0.4)]">
              Read the Debrief
            </button>
          </motion.div>
        )}

        {!loadingAI && isEpilogue && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="text-center">
            <button onClick={onEpilogue}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-sm bg-[#c9a87c] text-[#07111f] hover:bg-[#d4b88c] transition-all shadow-[0_0_35px_rgba(201,168,124,0.4)]">
              Reveal Your Flight Profile
            </button>
          </motion.div>
        )}

        {/* Live stats strip */}
        {session?.stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-12 pt-8 border-t border-white/5">
            <p className="text-white/25 text-xs uppercase tracking-widest mb-4 text-center">Current Stats</p>
            <StatBar stats={session.stats} />
          </motion.div>
        )}
      </div>
    </div>
  );
}