import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Clock, ChevronDown, ChevronUp, Play, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ENERGY_COLORS = {
  low: { bg: '#10b98118', text: '#10b981', label: 'Low Energy' },
  medium: { bg: '#f59e0b18', text: '#f59e0b', label: 'Medium Energy' },
  high: { bg: '#f9731618', text: '#f97316', label: 'High Energy' },
};

// Built-in warmups that don't require DB
const BUILTIN_WARMUPS = [
  {
    id: 'builtin-1',
    name: 'Pre-Flight',
    duration_min: 10,
    duration_max: 10,
    description: 'One win, one challenge, one question. Opens the room.',
    energy: 'low',
    how_to_facilitate: [
      'Go around the room — each person shares one recent win (30 sec max).',
      'Each person names one current challenge they\'re navigating.',
      'Each person poses one question they want the room\'s input on.',
      'Facilitator notes recurring themes on a shared screen or whiteboard.',
    ],
    keywords: ['warmup', 'check-in', 'opening'],
  },
  {
    id: 'builtin-2',
    name: 'Two Truths & a Lie (Aerospace Edition)',
    duration_min: 10,
    duration_max: 15,
    description: 'Classic icebreaker with an aviation/space twist.',
    energy: 'medium',
    how_to_facilitate: [
      'Each person writes 2 true facts and 1 lie about themselves — aerospace career, travel, or projects.',
      'Share them in order. The room guesses which is the lie.',
      'Person reveals the truth. Group reacts.',
      'Rotate until everyone has gone or time is up.',
    ],
    keywords: ['icebreaker', 'fun', 'connection'],
  },
  {
    id: 'builtin-3',
    name: 'Emoji Check-In',
    duration_min: 5,
    duration_max: 5,
    description: 'Everyone shares one emoji that captures their current state. Fast and honest.',
    energy: 'low',
    how_to_facilitate: [
      'Ask everyone to drop one emoji in the chat (or say it aloud) that represents where they are right now.',
      'No explanation needed — unless they want to share.',
      'Facilitator acknowledges the range and opens the session.',
    ],
    keywords: ['quick', 'virtual', 'check-in'],
  },
  {
    id: 'builtin-4',
    name: 'The Hot Take Round',
    duration_min: 10,
    duration_max: 10,
    description: 'Everyone shares one spicy opinion about the industry. No debate — just statements.',
    energy: 'high',
    how_to_facilitate: [
      'Set the rule: one hot take per person, no defending, no debating.',
      'Go around the room — each person states their opinion in one sentence.',
      'Reactions allowed (emojis, gasps, applause) but no rebuttals.',
      'Facilitator can choose to revisit one for deeper discussion later.',
    ],
    keywords: ['opinions', 'energy', 'debate', 'fun'],
  },
  {
    id: 'builtin-5',
    name: 'Word Association Blitz',
    duration_min: 5,
    duration_max: 7,
    description: 'Rapid-fire word association to wake up the brain.',
    energy: 'high',
    how_to_facilitate: [
      'Facilitator starts with a seed word (e.g. "launch", "orbit", "fuel").',
      'Each person says the first word that comes to mind — no pausing.',
      'Go around the room 2-3 times.',
      'Close by noting any surprising or recurring words that emerged.',
    ],
    keywords: ['fast', 'brain', 'creative', 'energy'],
  },
  {
    id: 'builtin-6',
    name: 'One Word Weather Report',
    duration_min: 5,
    duration_max: 5,
    description: 'Each person describes their energy as weather. Quick, metaphorical, revealing.',
    energy: 'low',
    how_to_facilitate: [
      'Ask: "If your energy right now was a weather pattern, what would it be?"',
      'Each person answers in one word or phrase: "Foggy but clearing", "Full storm", "Clear skies", etc.',
      'Facilitator reflects back what they heard before moving on.',
    ],
    keywords: ['metaphor', 'quick', 'check-in', 'creative'],
  },
];

function WarmUpCard({ warmup, onRunLive }) {
  const [expanded, setExpanded] = useState(false);
  const energy = ENERGY_COLORS[warmup.energy] || ENERGY_COLORS.medium;

  return (
    <motion.div layout className="rounded-2xl border border-white/10 overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)' }}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: energy.bg }}>
          <Flame className="w-4 h-4" style={{ color: energy.text }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white font-bold text-sm">{warmup.name}</p>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: energy.bg, color: energy.text }}>{energy.label}</span>
          </div>
          <p className="text-white/50 text-xs mt-0.5">{warmup.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{warmup.duration_min}{warmup.duration_max !== warmup.duration_min ? `–${warmup.duration_max}` : ''} min</span>
          </div>
          <button onClick={() => setExpanded(e => !e)}
            className="text-white/40 hover:text-[#c9a87c] transition-colors p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-white/8 px-5 pb-5 pt-4">
            <p className="text-[#c9a87c] text-xs font-bold uppercase tracking-wider mb-3">How to Facilitate</p>
            <ol className="space-y-2 mb-4">
              {(warmup.how_to_facilitate || []).map((step, i) => (
                <li key={i} className="flex gap-2 text-xs text-white/60 leading-relaxed">
                  <span className="font-bold text-[#c9a87c] shrink-0">{i + 1}.</span> {step}
                </li>
              ))}
            </ol>
            <button onClick={() => onRunLive(warmup)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#07111f]"
              style={{ background: 'linear-gradient(135deg, #c9a87c, #d4b88c)' }}>
              <Play className="w-3.5 h-3.5" /> Run This Warm-Up
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LiveWarmUp({ warmup, onClose }) {
  const [elapsed, setElapsed] = useState(0);
  const total = (warmup.duration_min || 5) * 60;
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed(e => Math.min(e + 1, total)), 1000);
    return () => clearInterval(t);
  }, [running, total]);

  const remaining = total - elapsed;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const steps = warmup.how_to_facilitate || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(7,17,31,0.97)' }}>
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[#c9a87c] text-xs font-bold uppercase tracking-widest">Live Warm-Up</span>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <h2 className="text-white text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {warmup.name}
        </h2>
        <p className="text-white/50 text-sm mb-8">{warmup.description}</p>

        {/* Timer */}
        <div className="text-center mb-8">
          <div className="text-7xl font-bold text-[#c9a87c] font-mono mb-3" style={{ fontFamily: 'monospace' }}>
            {mm}:{ss}
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-gradient-to-r from-[#c9a87c] to-[#f97316] rounded-full transition-all"
              style={{ width: `${(elapsed / total) * 100}%` }} />
          </div>
          <button onClick={() => setRunning(r => !r)}
            className="px-8 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: running ? 'rgba(255,255,255,0.1)' : 'rgba(201,168,124,0.2)', color: '#c9a87c', border: '1px solid rgba(201,168,124,0.3)' }}>
            {running ? 'Pause' : elapsed === 0 ? 'Start' : 'Resume'}
          </button>
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {steps.map((step, i) => (
              <button key={i} onClick={() => setStepIdx(i)}
                className={`w-full flex items-start gap-3 px-5 py-3.5 text-left border-b border-white/5 last:border-0 transition-colors ${stepIdx === i ? 'bg-[#c9a87c]/10' : 'hover:bg-white/5'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${stepIdx === i ? 'bg-[#c9a87c] text-[#07111f]' : 'bg-white/10 text-white/40'}`}>{i + 1}</span>
                <span className={`text-xs leading-relaxed ${stepIdx === i ? 'text-white' : 'text-white/50'}`}>{step}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function WarmUpLibrary() {
  const [filter, setFilter] = useState('all');
  const [liveWarmup, setLiveWarmup] = useState(null);

  // Merge built-ins with any DB tactics tagged as warmup
  const warmups = BUILTIN_WARMUPS;

  const filtered = filter === 'all' ? warmups : warmups.filter(w => w.energy === filter);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <AnimatePresence>
        {liveWarmup && <LiveWarmUp warmup={liveWarmup} onClose={() => setLiveWarmup(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-5 h-5 text-[#f97316]" />
          <h2 className="text-white text-2xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Warm-Up Activities
          </h2>
        </div>
        <p className="text-white/50 text-sm">Quick energizers to open the room. Run any of these live with a built-in timer and step tracker.</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['all', 'low', 'medium', 'high'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
              filter === f ? 'bg-[#c9a87c] text-[#07111f]' : 'text-white/50 border border-white/10 hover:text-white hover:border-white/25'
            }`}>
            {f === 'all' ? 'All' : ENERGY_COLORS[f].label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filtered.map(w => (
          <WarmUpCard key={w.id} warmup={w} onRunLive={setLiveWarmup} />
        ))}
      </div>
    </div>
  );
}