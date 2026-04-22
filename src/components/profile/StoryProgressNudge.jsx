import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PenLine, Sparkles, CheckCircle2, Circle } from 'lucide-react';

const brand = { navy: '#1e3a5a', gold: '#c9a87c', cream: '#faf8f5' };

const PROMPT_STEPS = [
  { id: 'concept', label: 'The Why' },
  { id: 'explore', label: 'The Journey' },
  { id: 'character', label: 'Your Role' },
  { id: 'function', label: 'The Impact' },
  { id: 'structure', label: 'What\'s Next' },
  { id: 'style', label: 'Your Voice' },
];

export default function StoryProgressNudge({ draft, onResume }) {
  const answers = draft?.answers || {};
  const answered = PROMPT_STEPS.filter(s => answers[s.id]?.trim().length > 0).length;
  const total = PROMPT_STEPS.length;
  const pct = Math.round((answered / total) * 100);

  return (
    <motion.button
      type="button"
      onClick={onResume}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border-2 overflow-hidden text-left transition-all hover:shadow-lg cursor-pointer group"
      style={{ borderColor: `${brand.gold}50`, background: brand.cream }}
    >
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: `${brand.navy}10` }}>
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: `linear-gradient(90deg, ${brand.navy}, ${brand.gold})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
            style={{ background: `${brand.gold}18` }}
          >
            <PenLine className="w-5 h-5" style={{ color: brand.gold }} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold" style={{ color: brand.navy, fontFamily: "'Playfair Display', serif" }}>
              Your story is in progress
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {answered}/{total} questions answered · {pct}% complete
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition-all group-hover:scale-105"
            style={{ background: brand.navy, color: 'white' }}
          >
            <Sparkles className="w-3 h-3" /> Continue
          </span>
        </div>

        {/* Step checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5">
          {PROMPT_STEPS.map(step => {
            const done = answers[step.id]?.trim().length > 0;
            return (
              <div key={step.id} className="flex items-center gap-1.5">
                {done ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                )}
                <span className={`text-[11px] truncate ${done ? 'text-slate-400 line-through' : 'text-slate-600 font-medium'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.button>
  );
}