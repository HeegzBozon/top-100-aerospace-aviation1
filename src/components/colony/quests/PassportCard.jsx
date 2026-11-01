import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import BadgeFace from './BadgeFace';

const FIELDS = [
  { key: 'title', label: 'Title', max: 80, ph: 'Propulsion Engineer' },
  { key: 'organization', label: 'Organization', max: 80, ph: 'Your company or school' },
  { key: 'tagline', label: 'One line', max: 140, ph: 'What you are working on' },
];

// The temporary business card / badge, worn on campus until it becomes a real record.
export default function PassportCard({ passport, isGuest, onSave }) {
  const [name, setName] = useState(passport.name || '');
  const [card, setCard] = useState(passport.card || {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = async () => {
    setSaving(true);
    await onSave(isGuest ? { name: name.trim().slice(0, 60), card } : { card });
    setSaving(false); setSaved(true);
  };
  return (
    <div className="space-y-3">
      <BadgeFace name={isGuest ? name : passport.name} card={card} passport={passport} isGuest={isGuest} />
      {isGuest && (
        <label className="block text-xs text-editorial-cream/70">Name
          <input value={name} maxLength={60} onChange={e => { setName(e.target.value); setSaved(false); }}
            className="mt-1 w-full rounded border border-white/15 bg-white/5 px-2 py-1.5 text-editorial-cream" />
        </label>
      )}
      {FIELDS.map(f => (
        <label key={f.key} className="block text-xs text-editorial-cream/70">{f.label}
          <input value={card[f.key] || ''} maxLength={f.max} placeholder={f.ph}
            onChange={e => { setCard(c => ({ ...c, [f.key]: e.target.value })); setSaved(false); }}
            className="mt-1 w-full rounded border border-white/15 bg-white/5 px-2 py-1.5 text-editorial-cream placeholder:text-editorial-cream/30" />
        </label>
      ))}
      <button type="button" onClick={save} disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded bg-editorial-copper py-2 text-sm font-semibold text-editorial-cream">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}{saved ? 'Saved' : isGuest ? 'Save on this device' : 'Save to my account'}
      </button>
    </div>
  );
}