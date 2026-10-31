import { useState } from 'react';
import { STAGES, BUNDLES } from './inboxFunnel';

// Compose a custom tile: a name, the stage it sits in, and the categories it adds up.
export default function FunnelCustomForm({ onAdd, onCancel }) {
  const [label, setLabel] = useState('');
  const [stage, setStage] = useState('top');
  const [picked, setPicked] = useState([]);
  const flip = (k) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));
  const ready = label.trim() && picked.length;
  return (
    <div className="mt-2 w-full rounded border border-editorial-copper/40 bg-white p-2">
      <p className="pd-label" style={{ fontSize: 9 }}>New metric</p>
      <input value={label} onChange={(e) => setLabel(e.target.value.slice(0, 24))} placeholder="e.g. Warm pipeline"
        className="mt-1 w-full rounded border border-editorial-navy/20 px-2 py-1.5 font-body text-editorial-navy" />
      <select value={stage} onChange={(e) => setStage(e.target.value)}
        className="mt-1.5 w-full rounded border border-editorial-navy/20 bg-white px-2 py-1.5 font-body text-editorial-navy">
        {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
      </select>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {BUNDLES.map((b) => (
          <button key={b.key} type="button" onClick={() => flip(b.key)}
            className={`rounded border px-2 py-1 font-body text-[11px] ${picked.includes(b.key) ? 'border-editorial-copper bg-editorial-navy text-editorial-cream' : 'border-editorial-navy/20 text-editorial-navy'}`}>
            {b.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-end gap-1.5">
        <button type="button" onClick={onCancel} className="px-2 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-editorial-navy/70">Cancel</button>
        <button type="button" disabled={!ready} onClick={() => onAdd({ label: label.trim(), stage, bundles: picked })}
          className="rounded bg-editorial-copper px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-editorial-cream disabled:opacity-40">Add</button>
      </div>
    </div>
  );
}