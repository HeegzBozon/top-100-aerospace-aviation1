import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ShieldCheck } from 'lucide-react';
import { brand, ink } from './NominateConfig';

// One question, asked only when a filing arrives faster than a person reads the form or
// from an address already at the desk today. The answer is checked at the desk, never here
// — this surface only carries it.
export default function NominateChallenge({ question, submitting, onVerify, onCancel }) {
  const [answer, setAnswer] = useState('');

  return (
    <div
      className="mb-5 rounded-2xl border-2 p-5"
      style={{ borderColor: `${brand.gold}66`, background: `${brand.gold}0D` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" style={{ color: ink.label }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ink.label }}>
          One check before filing
        </p>
      </div>

      <p className="mb-3 text-sm leading-relaxed" style={{ color: ink.body }}>
        {question}
      </p>

      <Input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && answer.trim() && !submitting) onVerify(answer.trim()); }}
        placeholder="Full name"
        aria-label="Confirmation answer"
        className="h-12 bg-white text-base"
        autoFocus
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={() => onVerify(answer.trim())}
          disabled={!answer.trim() || submitting}
          className="gap-2 rounded-full px-6 py-5 text-sm font-bold text-white disabled:opacity-40"
          style={{ background: brand.navy }}
        >
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Filing…</> : 'File my nominations'}
        </Button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold"
            style={{ color: ink.soft }}
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
}