import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C, BTN_BASE, BTN } from '@/components/crm/crmConfig';
import { NOTICE_CATEGORIES } from './classifiedsConfig';

const FIELD = 'w-full rounded-lg px-2.5 py-2 text-[12.5px] outline-none';
const FIELD_STYLE = { background: '#fff', border: `1px solid ${C.border}`, color: C.navy };

// A notice put on the open board by the Fellow themselves. Nothing is written on
// anyone's behalf, and nothing here carries a price: the board is a place to say a
// thing, not to sell one.
export default function NoticeComposer({ user, onPosted, onCancel }) {
  const [form, setForm] = useState({ title: '', category: 'collaboration', summary: '', body: '', place: '', link: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('A notice needs a headline.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await base44.entities.Classified.create({
        title: form.title.trim(),
        category: form.category,
        summary: form.summary.trim(),
        body: form.body.trim(),
        place: form.place.trim(),
        link: form.link.trim(),
        posted_by_email: user.email,
        posted_by_name: user.full_name || '',
        status: 'open',
      });
      onPosted?.();
    } catch {
      setError('The notice could not be put up. Try again.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-3 rounded-xl px-3 py-3" style={{ background: C.paper, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: C.copper }}>
          Put a notice up
        </p>
        <button type="button" onClick={onCancel} aria-label="Close the notice" className="p-1" style={{ color: C.muted }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <input
          value={form.title}
          onChange={(event) => set('title', event.target.value)}
          placeholder="Headline *"
          aria-label="Headline"
          className={FIELD}
          style={FIELD_STYLE}
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={form.category}
            onChange={(event) => set('category', event.target.value)}
            aria-label="Kind of notice"
            className={FIELD}
            style={FIELD_STYLE}
          >
            {NOTICE_CATEGORIES.map((item) => (
              <option key={item.key} value={item.key}>{item.label}</option>
            ))}
          </select>
          <input
            value={form.place}
            onChange={(event) => set('place', event.target.value)}
            placeholder="Where"
            aria-label="Where"
            className={FIELD}
            style={FIELD_STYLE}
          />
        </div>
        <input
          value={form.summary}
          onChange={(event) => set('summary', event.target.value)}
          placeholder="One line under the headline"
          aria-label="One line under the headline"
          maxLength={140}
          className={FIELD}
          style={FIELD_STYLE}
        />
        <textarea
          value={form.body}
          onChange={(event) => set('body', event.target.value)}
          placeholder="The notice itself"
          aria-label="The notice itself"
          rows={4}
          className={FIELD}
          style={FIELD_STYLE}
        />
        <input
          value={form.link}
          onChange={(event) => set('link', event.target.value)}
          placeholder="Where to answer it (optional)"
          aria-label="Where to answer it"
          className={FIELD}
          style={FIELD_STYLE}
        />
      </div>

      {error ? <p className="mt-2 text-[11px]" style={{ color: '#9B2C2C' }}>{error}</p> : null}

      <button type="submit" disabled={saving} className={`${BTN_BASE} mt-2.5 w-full`} style={BTN.primary}>
        {saving ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Putting it up</> : 'Put it on the board'}
      </button>
    </form>
  );
}