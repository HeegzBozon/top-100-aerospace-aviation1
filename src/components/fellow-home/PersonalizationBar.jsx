import { useState } from 'react';
import { Palette, ChevronUp, ChevronDown, X, Lock } from 'lucide-react';
import { ACCENTS, COVERS, LOCKED_MODULES, DEFAULT_ACCENT, moduleLabel, B } from './fellowHomeConfig';

// Variants, not freedom. No blank fields anywhere in here.
export default function PersonalizationBar({ settings, order, accent, onChange, saving, error }) {
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
    <div className="rounded-2xl p-5 w-full sm:w-auto" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>
          Personalize {saving && <span style={{ color: B.muted }}>· saving</span>}
        </p>
        <button onClick={() => setOpen(false)} style={{ color: B.muted }}><X className="w-4 h-4" /></button>
      </div>

      {error && (
        <p className="text-xs mb-4 rounded-lg px-3 py-2" style={{ color: '#8a3b2a', background: '#fbeee9' }}>
          {error}
        </p>
      )}

      <p className="text-xs font-semibold mb-1" style={{ color: B.navy }}>Domain accent</p>
      <p className="text-[11px] mb-2" style={{ color: B.muted }}>One accent per domain. Approved set only.</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {ACCENTS.map((a) => (
          <button
            key={a.key}
            onClick={() => onChange({ domain_accent: a.key })}
            title={a.label}
            className="w-8 h-8 rounded-full transition-transform hover:scale-105"
            style={{
              background: a.value,
              outline: (settings?.domain_accent || DEFAULT_ACCENT) === a.key ? `2px solid ${B.navy}` : 'none',
              outlineOffset: '2px',
            }}
          />
        ))}
      </div>

      <p className="text-xs font-semibold mb-1" style={{ color: B.navy }}>Cover</p>
      <p className="text-[11px] mb-2" style={{ color: B.muted }}>Verified asset library. No uploads.</p>
      <div className="flex gap-2 mb-5 flex-wrap">
        {COVERS.map((c) => (
          <button
            key={c.key}
            onClick={() => onChange({ cover_asset_id: c.key })}
            className="w-16 h-11 rounded-lg overflow-hidden text-[9px] font-semibold flex items-center justify-center"
            style={{
              background: c.url ? `url(${c.url}) center/cover` : B.sand,
              color: B.navy,
              outline: (settings?.cover_asset_id || 'none') === c.key ? `2px solid ${B.navy}` : `1px solid ${B.border}`,
              outlineOffset: '1px',
            }}
          >
            {!c.url && 'None'}
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold mb-2" style={{ color: B.navy }}>Module order</p>
      <div className="space-y-1.5">
        {LOCKED_MODULES.map((m, i) => (
          <div key={m.key} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: B.sand }}>
            <span className="text-[10px] font-bold w-4" style={{ color: B.muted }}>{i + 1}</span>
            <span className="text-xs font-medium flex-1" style={{ color: B.navy }}>{m.label}</span>
            <Lock className="w-3.5 h-3.5" style={{ color: B.muted }} />
          </div>
        ))}
        {order.map((key, i) => (
          <div key={key} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: B.cream }}>
            <span className="text-[10px] font-bold w-4" style={{ color: B.muted }}>{i + 3}</span>
            <span className="text-xs font-medium flex-1" style={{ color: B.navy }}>{moduleLabel(key)}</span>
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