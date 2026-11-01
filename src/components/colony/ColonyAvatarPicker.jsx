import { useEffect, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import AvatarGenerator from '@/components/colony/AvatarGenerator';
import { AVATAR_OPTIONS, cleanAvatar, drawAvatar } from '@/components/colony/colonyAvatar';

const GROUPS = [['skin', 'Skin'], ['outfit', 'Outfit'], ['headgear', 'Headgear'], ['accent', 'Accent']];

// Choose your Colony character from the curated kit.
export default function ColonyAvatarPicker({ avatar, onSave, onClose }) {
  const [draft, setDraft] = useState(cleanAvatar(avatar));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const ctx = ref.current.getContext('2d');
    ctx.clearRect(0, 0, 96, 96);
    drawAvatar(ctx, 48, 56, draft, 'down', 5);
  }, [draft]);

  const save = async () => {
    setSaving(true); setError('');
    try { await onSave(draft); onClose(); } catch { setError('Could not save. Try again.'); }
    setSaving(false);
  };

  return (
    <div className="absolute inset-x-2 top-2 z-40 mx-auto max-h-[calc(100%-1rem)] max-w-sm overflow-y-auto rounded-lg border border-editorial-copper/60 bg-editorial-navy p-3 text-editorial-cream shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-heading text-lg">Your character</p>
        <button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <canvas ref={ref} width={96} height={96} className="mx-auto mb-2 block rounded bg-editorial-cream/10" />
      {GROUPS.map(([k, label]) => (
        <div key={k} className="mb-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-editorial-gold">{label}</p>
          <div className="flex flex-wrap gap-1.5">
            {AVATAR_OPTIONS[k].map(o => (
              <button key={o.key} onClick={() => setDraft(d => ({ ...d, [k]: o.key }))} title={o.label}
                className={`rounded border px-2 py-1 text-xs ${draft[k] === o.key ? 'border-editorial-copper bg-editorial-copper/30' : 'border-editorial-cream/20'}`}>
                {o.color ? <span className="block h-4 w-4 rounded-full" style={{ background: o.color }} /> : o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <AvatarGenerator draft={draft} setDraft={setDraft} />
      {error && <p className="mb-2 text-xs text-red-300">{error}</p>}
      <button onClick={save} disabled={saving} className="flex w-full items-center justify-center gap-2 rounded bg-editorial-copper py-2 text-sm font-semibold">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save character
      </button>
    </div>
  );
}