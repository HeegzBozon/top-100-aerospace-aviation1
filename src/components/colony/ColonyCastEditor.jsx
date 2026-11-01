import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

// Admin: pick a character, edit greeting, visibility and which actions they offer. Saves bump the version.
export default function ColonyCastEditor({ cast, configs, onSave, onClose }) {
  const [id, setId] = useState(cast[0].id);
  const base = cast.find(c => c.id === id);
  const cfg = configs[id] || {};
  const [draft, setDraft] = useState(null);
  const d = draft?.id === id ? draft : { id, greeting: cfg.greeting || '', visibility_state: cfg.visibility_state || 'active', hidden_actions: cfg.hidden_actions || [] };
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (p) => setDraft({ ...d, ...p });
  const save = async () => {
    setBusy(true); setErr('');
    try { await onSave(id, { greeting: d.greeting, visibility_state: d.visibility_state, hidden_actions: d.hidden_actions }); setDraft(null); }
    catch { setErr('Could not save. Try again.'); }
    setBusy(false);
  };
  return (
    <div className="absolute inset-3 z-30 mx-auto flex max-w-md flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 text-editorial-cream shadow-xl">
      <div className="flex items-center justify-between border-b border-editorial-copper/50 px-4 py-3">
        <p className="font-heading text-lg">Campus cast</p>
        <button type="button" onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
        <select value={id} onChange={e => setId(e.target.value)} className="w-full rounded bg-white/10 px-2 py-2">
          {cast.map(c => <option key={c.id} value={c.id} className="text-black">{c.name} · {c.role}</option>)}
        </select>
        <p className="text-[10px] uppercase tracking-widest text-editorial-gold">Version {cfg.content_version || 0}{cfg.updated_by ? ` · ${cfg.updated_by}` : ''}</p>
        <label className="block">Greeting
          <textarea value={d.greeting} placeholder={base.greeting} onChange={e => set({ greeting: e.target.value })} rows={3} className="mt-1 w-full rounded bg-white/10 p-2" />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={d.visibility_state === 'active'} onChange={e => set({ visibility_state: e.target.checked ? 'active' : 'hidden' })} /> Visible on campus
        </label>
        <p>Actions offered</p>
        {(base.allActions || []).map(a => (
          <label key={a.key} className="flex items-center gap-2 pl-2">
            <input type="checkbox" checked={!d.hidden_actions.includes(a.key)}
              onChange={e => set({ hidden_actions: e.target.checked ? d.hidden_actions.filter(k => k !== a.key) : [...d.hidden_actions, a.key] })} />
            {a.label}
          </label>
        ))}
        {err && <p className="text-red-300">{err}</p>}
      </div>
      <button type="button" disabled={busy} onClick={save} className="m-3 flex items-center justify-center gap-2 rounded bg-editorial-copper py-2 font-semibold">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save character
      </button>
    </div>
  );
}