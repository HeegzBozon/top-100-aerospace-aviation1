import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { METRICS, OKR_TEMPLATES } from './okrTemplates';

const field = 'w-full rounded-[5px] border border-editorial-cream/15 bg-editorial-navy/60 px-2 py-1.5 text-editorial-cream outline-none focus:border-editorial-gold/60';

// Start from a template, then make it your own: the line, the metrics, the targets.
export default function OkrEditor({ okr, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...okr, key_results: okr.key_results.map((k) => ({ ...k })) });
  const [busy, setBusy] = useState(false);
  const setKr = (i, patch) => setDraft((d) => ({ ...d, key_results: d.key_results.map((k, j) => (j === i ? { ...k, ...patch } : k)) }));

  const submit = async () => {
    setBusy(true);
    await onSave(draft);
    setBusy(false);
    onClose();
  };

  return (
    <div className="space-y-2.5 px-3 pb-3 pt-1">
      <div className="flex gap-1.5 overflow-x-auto">
        {OKR_TEMPLATES.map((t) => (
          <button key={t.key} type="button" onClick={() => setDraft({ template_key: t.key, objective: t.objective, key_results: t.key_results.map((k) => ({ ...k })) })}
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${draft.template_key === t.key ? 'border-editorial-gold bg-editorial-gold/15 text-editorial-gold' : 'border-editorial-cream/20 text-editorial-cream/60'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <input className={`${field} font-heading text-[14px]`} value={draft.objective} maxLength={90}
        onChange={(e) => setDraft({ ...draft, objective: e.target.value })} aria-label="Objective" />
      {draft.key_results.map((kr, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <select className={`${field} flex-1 text-[12px]`} value={kr.metric} onChange={(e) => setKr(i, { metric: e.target.value })}>
            {Object.entries(METRICS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
          <input type="number" min={1} className={`${field} w-16 text-[12px]`} value={kr.target}
            onChange={(e) => setKr(i, { target: Math.max(1, Number(e.target.value) || 1) })} aria-label="Target" />
          <button type="button" onClick={() => setDraft({ ...draft, key_results: draft.key_results.filter((_, j) => j !== i) })} className="text-editorial-cream/50" aria-label="Remove key result">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        {draft.key_results.length < 4 ? (
          <button type="button" onClick={() => setDraft({ ...draft, key_results: [...draft.key_results, { metric: 'captured', target: 10 }] })}
            className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-editorial-gold">
            <Plus className="h-3 w-3" /> Key result
          </button>
        ) : <span />}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="px-2 text-[9px] font-bold uppercase tracking-[0.16em] text-editorial-cream/60">Cancel</button>
          <button type="button" disabled={busy || !draft.objective.trim()} onClick={submit}
            className="inline-flex items-center gap-1 rounded-[5px] bg-editorial-copper px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-editorial-cream disabled:opacity-50">
            {busy && <Loader2 className="h-3 w-3 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}