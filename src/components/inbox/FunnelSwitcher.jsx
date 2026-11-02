import { useState } from 'react';
import { Plus, X } from 'lucide-react';

// The funnels a member keeps, as tabs: their role-shaped defaults, then any they named.
export default function FunnelSwitcher({ funnels, active, onPick, onAdd, onRemove, editing }) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const pill = 'flex items-center gap-1 rounded-full px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.12em]';
  return (
    <div className="mb-2 flex w-full flex-wrap items-center gap-1">
      {funnels.map((f) => (
        <span key={f.key} className={`${pill} ${active === f.key ? 'bg-editorial-navy text-editorial-cream' : 'border border-editorial-navy/20 text-editorial-navy'}`}>
          <button onClick={() => onPick(f.key)}>{f.label}</button>
          {editing && f.named && <button aria-label="Remove funnel" onClick={() => onRemove(f.key)}><X className="h-3 w-3" /></button>}
        </span>
      ))}
      {naming ? (
        <form className="flex gap-1" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { onAdd(name.trim()); setName(''); setNaming(false); } }}>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Funnel name"
            className="w-32 rounded border border-editorial-navy/20 px-2 py-0.5 text-xs" />
          <button className={`${pill} bg-editorial-copper text-editorial-cream`}>Add</button>
        </form>
      ) : (
        <button onClick={() => setNaming(true)} className={`${pill} border border-dashed border-editorial-copper text-editorial-copper`}>
          <Plus className="h-3 w-3" /> New funnel
        </button>
      )}
    </div>
  );
}