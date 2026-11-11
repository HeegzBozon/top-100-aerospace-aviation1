import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// The room's copy, kept by the house. An admin edits the words without touching code: the
// headline, the welcome, the prompts (or the zones, at the open table) and the credit line.
// The destinations of the three ways out are not editable here — they are the platform's
// own intake and media kit, never a patron's link.

const field =
  'mt-1.5 w-full border border-editorial-navy/20 bg-editorial-cream px-3 py-2 text-[12px] leading-relaxed text-editorial-navy outline-none focus:border-editorial-copper';
const label = 'text-[8.5px] font-bold uppercase tracking-[0.2em] text-editorial-navy/55';

const lines = (text) => text.split('\n').map((line) => line.trim()).filter(Boolean);

export default function LoungeComposer({ copy, onSaved, onCancel }) {
  const open = copy.key === 'networking';
  const [form, setForm] = useState({
    label: copy.label,
    eyebrow: copy.eyebrow,
    headline: copy.headline,
    welcome: copy.welcome,
    patron_name: copy.patron_name || '',
    patron_note: copy.patron_note || '',
    prompts: copy.prompts.map((p) => p.text).join('\n'),
    zones: copy.zones.map((z) => `${z.label} | ${z.text}`).join('\n'),
    icebreakers: copy.icebreakers.join('\n'),
  });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.headline.trim() || !form.welcome.trim()) {
      setError('A headline and a welcome, so the room always says something.');
      return;
    }
    setStatus('saving');
    try {
      const payload = {
        room_key: copy.key,
        label: form.label.trim(),
        eyebrow: form.eyebrow.trim(),
        headline: form.headline.trim(),
        welcome: form.welcome.trim(),
        patron_name: form.patron_name.trim(),
        patron_note: form.patron_note.trim(),
        prompts: lines(form.prompts).map((text, i) => ({ key: `p${i + 1}`, text })),
        zones: lines(form.zones).map((line, i) => {
          const [zoneLabel, ...rest] = line.split('|');
          return { key: `z${i + 1}`, label: (zoneLabel || '').trim(), text: rest.join('|').trim() };
        }).filter((zone) => zone.text),
        icebreakers: lines(form.icebreakers),
        patronage_url: copy.patronage_url || '/mediakit',
      };
      const rows = await base44.entities.SponsorLounge.filter({ room_key: copy.key });
      const existing = Array.isArray(rows) ? rows[0] : rows?.items?.[0];
      if (existing?.id) await base44.entities.SponsorLounge.update(existing.id, payload);
      else await base44.entities.SponsorLounge.create(payload);
      setStatus('idle');
      onSaved();
    } catch (failure) {
      setStatus('idle');
      setError(failure?.message || 'That did not save. Try again in a moment.');
    }
  };

  return (
    <form onSubmit={save} className="min-h-0 flex-1 overflow-y-auto bg-editorial-cream px-5 py-6 md:px-8">
      <p className="text-[8.5px] font-bold uppercase tracking-[0.28em] text-editorial-copper">House copy</p>
      <h3 className="mt-2 font-heading text-2xl leading-tight text-editorial-navy">Edit this room</h3>
      <p className="mt-2 max-w-[48ch] text-[11.5px] leading-relaxed text-editorial-navy/65">
        What is written here replaces the room’s defaults. Sponsor credit is attribution: it changes
        no position in the index, and the firewall line stays beneath it.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Room name</span>
          <input className={field} value={form.label} onChange={set('label')} />
        </label>
        <label className="block">
          <span className={label}>Eyebrow</span>
          <input className={field} value={form.eyebrow} onChange={set('eyebrow')} />
        </label>
      </div>
      <label className="mt-3 block">
        <span className={label}>Headline</span>
        <input className={field} value={form.headline} onChange={set('headline')} />
      </label>
      <label className="mt-3 block">
        <span className={label}>Welcome</span>
        <textarea rows={4} className={field} value={form.welcome} onChange={set('welcome')} />
      </label>

      {open ? (
        <p className="mt-3 border-l-2 border-editorial-copper/60 pl-3 text-[10.5px] leading-relaxed text-editorial-navy/55">
          The offer this room sells is read from the published media kit. Its rates, bundle,
          audience figures and firewall are not edited here — they are changed on the card itself,
          so a buyer never reads one price in the room and another on the kit.
        </p>
      ) : (
        <label className="mt-3 block">
          <span className={label}>Prompts — one per line</span>
          <textarea rows={4} className={field} value={form.prompts} onChange={set('prompts')} />
        </label>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={label}>Sponsor of Record</span>
          <input className={field} value={form.patron_name} onChange={set('patron_name')} placeholder="Leave empty while the room is open" />
        </label>
        <label className="block">
          <span className={label}>Credit line</span>
          <input className={field} value={form.patron_note} onChange={set('patron_note')} />
        </label>
      </div>

      {error && <p className="mt-3 text-[11px] leading-relaxed text-editorial-copper">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button type="submit" disabled={status === 'saving'} className="desk-key desk-key-primary disabled:opacity-60">
          {status === 'saving' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Save the room
        </button>
        <button type="button" onClick={onCancel} className="pd-acct-link text-[9.5px]">
          Leave it as it was
        </button>
      </div>
    </form>
  );
}