import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import SensitivityFindings from '@/components/magazine/promotion/SensitivityFindings';

// The editor's own note on the mood the set goes out into: a loss in the industry, a
// grounding, a sensitive month, a house decision to stay quiet. It outranks every
// stylistic rule, and it is never printed: the writer reads it, the reader does not.
export default function PrCoachPanel({ notes, onChange, issueTitle, disabled }) {
  const append = (line) => {
    const next = notes.trim() ? `${notes.trim()}\n${line}` : line;
    onChange(next);
  };

  return (
    <div className="mt-5 rounded-xl p-4" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
      <div className="mb-1 flex items-center gap-2">
        <ShieldAlert className="h-3.5 w-3.5" style={{ color: P.copper }} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(30,58,90,0.5)' }}>
          PR context
        </p>
      </div>
      <p className="mb-2 text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.5)' }}>
        Notes for the writer, not for the reader. A loss in the industry, a grounding, a hard week:
        say it here and all six assets are written to sit alongside it.
      </p>

      <textarea
        value={notes}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={4}
        placeholder="For example: an aviation accident this week, so nothing celebratory, no 'soar', no urgency. Lead with the people. One calm line of acknowledgement at the top of the article and the email."
        aria-label="PR context for the writer"
        className="w-full resize-y rounded-lg px-3 py-2.5 text-[11.5px] leading-relaxed disabled:opacity-60"
        style={{ background: P.cream, border: '1px solid rgba(30,58,90,0.14)', color: P.navy }}
      />

      <SensitivityFindings issueTitle={issueTitle} onAddNote={append} />
    </div>
  );
}