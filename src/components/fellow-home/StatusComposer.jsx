import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FELLOW_STATUSES, statusByKey } from '@/components/fellow-home/fellowStatuses';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Sticky-note status composer. Curated emoji, inline pick — never a dropdown, never free text.
export default function StatusComposer({ statusKey, accent, saving, onChange }) {
  const [open, setOpen] = useState(false);
  const current = statusByKey(statusKey);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: B.sand, border: `1px solid ${B.border}` }}>
      <div className="h-1" style={{ background: accent }} />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>Status</span>
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: accent }} />}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center gap-3 text-left"
        >
          <span className="text-2xl leading-none">{current?.glyph || '☆'}</span>
          <span className="text-sm font-medium" style={{ color: current ? B.navy : '#8b95a1' }}>
            {current?.label || 'Set your status'}
          </span>
        </button>

        {open && (
          <div className="grid grid-cols-6 gap-1 pt-1">
            {FELLOW_STATUSES.map((s) => {
              const active = s.key === statusKey;
              return (
                <button
                  key={s.key}
                  type="button"
                  title={s.label}
                  onClick={() => { onChange(active ? '' : s.key); setOpen(false); }}
                  className="aspect-square rounded-lg flex items-center justify-center text-lg transition-colors"
                  style={{
                    background: active ? `${B.navy}0f` : 'transparent',
                    border: `1px solid ${active ? accent : 'transparent'}`,
                  }}
                >
                  {s.glyph}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}