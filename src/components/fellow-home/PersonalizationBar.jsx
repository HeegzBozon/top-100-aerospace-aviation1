import { useState } from 'react';
import { Palette, ChevronUp, ChevronDown, X } from 'lucide-react';
import { ACCENTS, COVERS, MODULES, B } from './fellowHomeConfig';

// Variants, not freedom. No blank fields anywhere in here.
export default function PersonalizationBar({ user, order, accent, onChange }) {
  const [open, setOpen] = useState(false);

  const move = (key, dir) => {
    const next = [...order];
    const i = next.indexOf(key);
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange({ module_order: next });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full transition-opacity hover:opacity-80"
        style={{ color: B.navy, background: '#fff', border: `1px solid ${B.border}` }}
      >
        <Palette className="w-3.5 h-3.5" style={{ color: accent }} /> Personalize
      </button>
    );
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Personalize</p>
        <button onClick={() => setOpen(false)} style={{ color: B.muted }}><X className="w-4 h-4" /></button>
      </div>

      <p className="text-xs font-semibold mb-2" style={{ color: B.navy }}>Accent</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {ACCENTS.map((a) => (
          <button
            key={a.key}
            onClick={() => onChange({ accent_color: a.key })}
            title={a.label}
            className="w-8 h-8 rounded-full transition-transform hover:scale-105"
            style={{
              background: a.value,
              outline: (user?.accent_color || 'rose_gold') === a.key ? `2px solid ${B.navy}` : 'none',
              outlineOffset: '2px',
            }}
          />
        ))}
      </div>

      <p className="text-xs font-semibold mb-2" style={{ color: B.navy }}>Cover</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {COVERS.map((c) => (
          <button
            key={c.key}
            onClick={() => onChange({ cover_key: c.key })}
            className="w-16 h-11 rounded-lg overflow-hidden text-[9px] font-semibold flex items-center justify-center"
            style={{
              background: c.url ? `url(${c.url}) center/cover` : B.sand,
              color: B.navy,
              outline: (user?.cover_key || 'none') === c.key ? `2px solid ${B.navy}` : `1px solid ${B.border}`,
              outlineOffset: '1px',
            }}
          >
            {!c.url && 'None'}
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold mb-2" style={{ color: B.navy }}>Module order</p>
      <div className="space-y-1.5">
        {order.map((key, i) => (
          <div key={key} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: B.cream }}>
            <span className="text-xs font-medium flex-1" style={{ color: B.navy }}>
              {(MODULES.find((m) => m.key === key) || {}).label || key}
            </span>
            <button onClick={() => move(key, -1)} disabled={i === 0} className="disabled:opacity-25" style={{ color: B.muted }}>
              <ChevronUp className="w-4 h-4" />
            </button>
            <button onClick={() => move(key, 1)} disabled={i === order.length - 1} className="disabled:opacity-25" style={{ color: B.muted }}>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}