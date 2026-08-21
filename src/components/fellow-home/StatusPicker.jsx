import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { FELLOW_STATUSES, statusByKey } from '@/components/fellow-home/fellowStatuses';
import { B } from '@/components/fellow-home/fellowHomeConfig';

export default function StatusPicker({ statusKey, accent, saving, onChange, compact }) {
  const [open, setOpen] = useState(false);
  const current = statusByKey(statusKey);

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 text-left rounded-lg px-2.5 py-2 transition-colors hover:bg-black/[0.03] ${compact ? '' : 'w-full'}`}
        style={{ border: `1px solid ${B.navy}14` }}
      >
        <span className="text-lg leading-none">{current?.glyph || '☆'}</span>
        <span className="flex-1 text-sm font-medium" style={{ color: current ? B.navy : '#8b95a1' }}>
          {current?.label || 'Set your status'}
        </span>
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: accent }} />}
      </button>

      {open && (
        <div className="mt-2 grid grid-cols-1 gap-1">
          {FELLOW_STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => {
                onChange(s.key === statusKey ? '' : s.key);
                setOpen(false);
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-black/[0.04]"
              style={{ color: B.navy }}
            >
              <span className="text-base leading-none">{s.glyph}</span>
              <span className="flex-1">{s.label}</span>
              {s.key === statusKey && <Check className="w-3.5 h-3.5" style={{ color: accent }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}