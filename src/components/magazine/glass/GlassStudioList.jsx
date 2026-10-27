import { useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// A run of keys on the glass, in the console's idiom: a kicker across the head, the
// hints the hand needs, an optional readout above the list, and the keys themselves —
// numbered, parted by a hairline, the one under the ring filled navy. The ring walks
// this list; the turn past either end is the console's to hand to the glass.
export default function GlassStudioList({ kicker, hint = '◀▶ Walk · A Open', note, entries = [], cursor = 0, onOpen, onBack, empty }) {
  const rows = useRef([]);

  useEffect(() => {
    rows.current[cursor]?.scrollIntoView({ block: 'nearest' });
  }, [cursor, entries.length]);

  return (
    <div className="px-3 pb-5 pt-3">
      <div className="flex items-center justify-between gap-3 pb-2" style={{ borderBottom: `1px solid rgba(30,58,90,0.12)` }}>
        <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: P.copper }}>
          {kicker}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-[7.5px] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(30,58,90,0.45)' }}>
            {hint}
          </p>
          {onBack && (
            <button type="button" onClick={onBack} className="flex items-center gap-0.5 text-[7.5px] font-bold uppercase tracking-[0.16em]" style={{ color: P.navy }}>
              <ChevronLeft className="h-3 w-3" /> Back
            </button>
          )}
        </div>
      </div>

      {note ? <div className="pt-3">{note}</div> : null}

      {entries.length === 0 ? (
        <div className="pt-6">{empty}</div>
      ) : (
        <div className="mt-3 space-y-1.5">
          {entries.map((entry, i) => {
            const Icon = entry.icon;
            const active = i === cursor;
            return (
              <button
                key={entry.key}
                ref={(el) => (rows.current[i] = el)}
                type="button"
                onClick={() => onOpen?.(i, entry)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-colors"
                style={{
                  background: active ? P.navy : '#fff',
                  border: `1px solid ${active ? P.navy : 'rgba(30,58,90,0.1)'}`,
                }}
              >
                <span
                  className="w-6 flex-none font-mono text-[10px]"
                  style={{ color: active ? P.gold : 'rgba(30,58,90,0.35)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {Icon ? (
                  <Icon className="h-3.5 w-3.5 flex-none" style={{ color: active ? P.gold : entry.tone === 'action' ? P.copper : P.navy }} />
                ) : null}
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-[12px] font-medium leading-tight"
                    style={{ color: active ? P.cream : entry.tone === 'action' ? P.copper : P.navy }}
                  >
                    {entry.label}
                  </span>
                  {entry.hint ? (
                    <span className="mt-0.5 block truncate text-[9.5px]" style={{ color: active ? 'rgba(250,248,245,0.62)' : 'rgba(30,58,90,0.45)' }}>
                      {entry.hint}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}