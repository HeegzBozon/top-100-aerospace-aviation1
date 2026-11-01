import { useState } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { PATHWAYS } from './discovery';
import PassportBioDraft from './PassportBioDraft';

const STATUS = { pending: 'Waiting for your review', approved: 'Approved', saved: 'On your record', declined: 'Kept private' };

// What the campus has learned, held for review. The player approves, keeps private, or
// removes each item; approved interview answers go to the Fellow record on request.
export default function PassportRecord({ passport, isGuest, onSave }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const items = Object.values(passport.discoveries || {});
  const pathways = passport.pathways || [];
  const setItem = (key, patch) => onSave({ discoveries: { ...passport.discoveries, [key]: { ...passport.discoveries[key], ...patch } } });
  const remove = (key) => { const d = { ...passport.discoveries }; delete d[key]; onSave({ discoveries: d }); };
  const togglePath = (k) => onSave({ pathways: pathways.includes(k) ? pathways.filter(x => x !== k) : [...pathways, k] });
  const toRecord = items.filter(i => i.status === 'approved' && i.prompt_key);

  const saveToRecord = async () => {
    setSaving(true); setError('');
    try {
      await base44.functions.invoke('saveProfileSettings', { documentary_prompts: Object.fromEntries(toRecord.map(i => [i.prompt_key, i.value])) });
      const d = { ...passport.discoveries };
      toRecord.forEach(i => { d[i.key] = { ...i, status: 'saved' }; });
      await onSave({ discoveries: d });
    } catch { setError('Could not save to your record. Try again.'); }
    setSaving(false);
  };

  return (
    <div className="space-y-4 text-editorial-cream">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-editorial-gold">My pathways</p>
        <p className="mb-2 text-[11px] text-editorial-cream/50">Starting preferences, not labels. Change them any time.</p>
        <div className="flex flex-wrap gap-1.5">
          {PATHWAYS.map(p => (
            <button key={p.key} type="button" onClick={() => togglePath(p.key)}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${pathways.includes(p.key) ? 'border-editorial-gold bg-editorial-gold/20' : 'border-editorial-cream/25 text-editorial-cream/60'}`}>{p.label}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-editorial-gold">What you've shared</p>
        {!items.length ? (
          <p className="mt-2 rounded border border-dashed border-editorial-cream/25 p-3 text-xs text-editorial-cream/60">Nothing yet. Answers you give the cast appear here for your review before anything is saved.</p>
        ) : items.map(i => (
          <div key={i.key} className="border-b border-white/5 py-2">
            <p className="text-[11px] text-editorial-gold/80">{i.label} · <span className="text-editorial-cream/50">{STATUS[i.status]} · self-reported</span></p>
            <p className="line-clamp-3 text-sm">{i.value}</p>
            <div className="mt-1 flex gap-3 text-[11px]">
              {i.status !== 'approved' && i.status !== 'saved' && <button type="button" onClick={() => setItem(i.key, { status: 'approved' })} className="flex items-center gap-1 text-editorial-gold"><Check className="h-3 w-3" />Approve</button>}
              {i.status !== 'declined' && <button type="button" onClick={() => setItem(i.key, { status: 'declined' })} className="text-editorial-cream/60">Keep private</button>}
              <button type="button" onClick={() => remove(i.key)} className="flex items-center gap-1 text-editorial-cream/60"><X className="h-3 w-3" />Remove</button>
            </div>
          </div>
        ))}
      </div>
      {isGuest ? (
        <p className="rounded border border-editorial-gold/40 p-3 text-xs text-editorial-cream/70">Sign in to save approved answers to your Fellow record. Until then they stay on this passport only.</p>
      ) : (
        <>
          {toRecord.length > 0 && (
            <button type="button" onClick={saveToRecord} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded bg-editorial-copper py-2 text-xs uppercase tracking-widest">
              {saving && <Loader2 className="h-3 w-3 animate-spin" />}Save {toRecord.length} approved to my record
            </button>
          )}
          {error && <p className="text-xs text-red-300">{error}</p>}
          <PassportBioDraft items={items.filter(i => i.status === 'approved' || i.status === 'saved')} />
        </>
      )}
    </div>
  );
}