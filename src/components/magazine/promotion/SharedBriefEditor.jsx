import React from 'react';
import { RefreshCw } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// The brief every asset is written from, as an editable page of facts.
export default function SharedBriefEditor({ brief, onChange, onRebuild, disabled }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
          The shared brief
        </p>
        <button
          type="button"
          onClick={onRebuild}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-40"
          style={{ color: P.copper }}
        >
          <RefreshCw className="h-3 w-3" /> Rebuild from issue
        </button>
      </div>
      <textarea
        value={brief}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={11}
        spellCheck={false}
        aria-label="The shared brief every asset is written from"
        className="w-full resize-y rounded-xl px-3 py-2.5 text-[11.5px] leading-relaxed disabled:opacity-60"
        style={{
          background: P.cream,
          border: '1px solid rgba(30,58,90,0.14)',
          color: P.navy,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        }}
      />
      <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.5)' }}>
        Every asset is written from this page, so the article, the posts, the email and the two
        captions agree on facts, numbers and the call to action. Change a line here and write the
        set again to bring all six back into line.
      </p>
    </div>
  );
}