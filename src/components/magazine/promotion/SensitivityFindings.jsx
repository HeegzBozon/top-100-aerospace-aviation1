import React, { useState } from 'react';
import { AlertTriangle, Check, Loader2, Newspaper, Plus } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { findingToNote } from '@/components/magazine/promotion/promotionContext';
import useSensitivitySweep from '@/components/magazine/promotion/useSensitivitySweep';

const RISK = {
  high: { label: 'Hold', color: '#B87333' },
  medium: { label: 'Careful', color: '#8F5C2C' },
  low: { label: 'Aware', color: '#1E3A5A' },
};

// What is happening in the field this week, and what to do about it in copy.
export default function SensitivityFindings({ issueTitle, onAddNote }) {
  const { result, status, error, sweep } = useSensitivitySweep({ issueTitle });
  const [added, setAdded] = useState([]);

  const checking = status === 'checking';

  const add = (item) => {
    onAddNote(findingToNote(item));
    setAdded((current) => [...current, item.topic]);
  };

  return (
    <div className="mt-4 rounded-xl p-4" style={{ background: P.cream, border: '1px solid rgba(30,58,90,0.12)' }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Newspaper className="h-3.5 w-3.5" style={{ color: P.navy }} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(30,58,90,0.55)' }}>
            The field this week
          </p>
        </div>
        <button
          type="button"
          onClick={sweep}
          disabled={checking}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-opacity hover:opacity-75 disabled:opacity-40"
          style={{ border: '1px solid rgba(30,58,90,0.22)', color: P.navy, background: '#fff' }}
        >
          {checking ? <Loader2 className="h-3 w-3 animate-spin" /> : <Newspaper className="h-3 w-3" />}
          {checking ? 'Reading the news' : result ? 'Check again' : 'Check the news'}
        </button>
      </div>

      {!result && !checking && !error && (
        <p className="mt-2 text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.5)' }}>
          A masthead never publishes into a silent room. This reads the last ten days of aerospace
          reporting and hands back what a writer should be careful of. Nothing is written from it
          until you add a line to your context.
        </p>
      )}

      {error && (
        <div className="mt-2 flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: P.copper }} />
          <p className="text-[11px] leading-relaxed" style={{ color: '#8F5C2C' }}>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-3 space-y-2.5">
          {result.fieldNote && (
            <p className="text-[11px] leading-relaxed italic" style={{ color: 'rgba(30,58,90,0.62)' }}>
              {result.fieldNote}
            </p>
          )}

          {result.items.length === 0 && (
            <p className="text-[11px]" style={{ color: 'rgba(30,58,90,0.5)' }}>
              Nothing significant in the window. The field is clear.
            </p>
          )}

          {result.items.map((item) => {
            const risk = RISK[item.risk] || RISK.medium;
            const isAdded = added.includes(item.topic);
            return (
              <div key={item.topic} className="rounded-lg p-3" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em]"
                      style={{ color: risk.color, border: `1px solid ${risk.color}` }}
                    >
                      {risk.label}
                    </span>
                    <p className="truncate text-[11.5px] font-semibold" style={{ color: P.navy }}>{item.topic}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => add(item)}
                    disabled={isAdded}
                    className="inline-flex flex-shrink-0 items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-45"
                    style={{ color: P.copper }}
                  >
                    {isAdded ? <><Check className="h-3 w-3" /> Added</> : <><Plus className="h-3 w-3" /> To context</>}
                  </button>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.66)' }}>{item.summary}</p>
                {item.guidance && (
                  <p className="mt-1 text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.5)' }}>
                    {item.guidance}
                  </p>
                )}
                {item.source && (
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.1em]" style={{ color: 'rgba(30,58,90,0.35)' }}>
                    {item.source}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}