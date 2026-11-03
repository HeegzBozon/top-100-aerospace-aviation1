import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { copyText } from '@/lib/clipboard';

// One deliverable: its fields, editable, each with its own copy key.
export default function PromotionAssetCard({ asset, values, onChange, disabled }) {
  const [copied, setCopied] = useState(null);

  const copy = async (key) => {
    const ok = await copyText(values?.[key] || '');
    if (!ok) return;
    setCopied(key);
    window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1600);
  };

  return (
    <div className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.1)' }}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h4 className="font-serif text-[13px]" style={{ color: P.navy }}>{asset.label}</h4>
        <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'rgba(30,58,90,0.42)' }}>
          {asset.surface}
        </p>
      </div>

      <div className="space-y-3">
        {asset.fields.map((field) => {
          const value = values?.[field.key] || '';
          return (
            <div key={field.key}>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
                  {field.label}
                  {field.hint && (
                    <span className="ml-2 font-normal normal-case tracking-normal" style={{ color: 'rgba(30,58,90,0.35)' }}>
                      {field.hint}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2.5">
                  {field.limit && (
                    <span
                      className="text-[10px] tabular-nums"
                      style={{ color: value.length > field.limit ? P.copper : 'rgba(30,58,90,0.35)' }}
                    >
                      {value.length}/{field.limit}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => copy(field.key)}
                    disabled={!value}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
                    style={{ color: copied === field.key ? P.copper : P.navy }}
                  >
                    {copied === field.key ? (
                      <><Check className="h-3 w-3" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy</>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={value}
                onChange={(event) => onChange(field.key, event.target.value)}
                disabled={disabled}
                rows={field.rows || 6}
                placeholder="Not written yet"
                aria-label={`${asset.label} · ${field.label}`}
                className="w-full resize-y rounded-lg px-3 py-2.5 text-xs leading-relaxed disabled:opacity-60"
                style={{
                  background: P.cream,
                  border: '1px solid rgba(30,58,90,0.14)',
                  color: P.navy,
                  fontFamily: field.mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
                  fontSize: field.mono ? '11px' : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}