import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { DISCIPLINES } from './conferenceRoomConfig';
import { Loader2, X } from 'lucide-react';

// Admin-only: concierge-creates a Mission Room for a named external event.
// TOP 100 is never the host; this is a coordination surface attached to the show.
export default function ConferenceRoomComposer({ user, accent, onSubmitted }) {
  const blank = {
    conference_name: '', conference_series: '', organizer: '',
    city: '', country: '', start_date: '', end_date: '',
    venue: '', official_url: '', domain_focus: 'space_rd',
    description: '', status: 'draft',
  };
  const [form, setForm] = useState(blank);
  const [focusRaw, setFocusRaw] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.conference_name || !form.start_date || !form.end_date) return;
    setBusy(true);
    const focus_areas = focusRaw
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ key: label.toLowerCase().replace(/[^a-z0-9]+/g, '_'), label }));
    try {
      await base44.entities.ConferenceRoom.create({
        ...form,
        domain_focus: form.domain_focus || undefined,
        focus_areas,
        facilitator_email: user.email,
        facilitator_name: user.full_name || '',
      });
      setForm(blank);
      setFocusRaw('');
      onSubmitted();
    } catch {
    } finally {
      setBusy(false);
    }
  };

  const field = (k, label, type = 'text', opts = {}) => (
    <label className="block" key={k}>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: B.muted }}>{label}</span>
      <input
        type={type}
        value={form[k]}
        onChange={set(k)}
        className="w-full text-xs rounded-md px-2 py-1.5"
        style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
        {...opts}
      />
    </label>
  );

  return (
    <div className="rounded-xl p-4" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: B.navy }}>New Mission Room</span>
        <button type="button" onClick={() => onSubmitted()} className="text-[10px]" style={{ color: B.muted }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {field('conference_name', 'Conference name *')}
        {field('conference_series', 'Series (e.g. IAC)')}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {field('organizer', 'Organizer')}
        {field('venue', 'Venue')}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
        {field('city', 'City')}
        {field('country', 'Country')}
        {field('start_date', 'Start *', 'date')}
        {field('end_date', 'End *', 'date')}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        {field('official_url', 'Official show URL', 'url')}
        <label className="block">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: B.muted }}>Domain focus</span>
          <select
            value={form.domain_focus}
            onChange={set('domain_focus')}
            className="w-full text-xs rounded-md px-2 py-1.5"
            style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
          >
            {DISCIPLINES.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
          </select>
        </label>
      </div>

      <label className="block mb-2">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: B.muted }}>What this room coordinates</span>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={2}
          className="w-full text-xs rounded-md px-2 py-1.5 resize-none"
          style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
        />
      </label>

      <label className="block mb-2">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: B.muted }}>Focus sub-rooms (one per line)</span>
        <textarea
          value={focusRaw}
          onChange={(e) => setFocusRaw(e.target.value)}
          rows={2}
          placeholder="e.g. On-orbit servicing&#10;Lunar economy"
          className="w-full text-xs rounded-md px-2 py-1.5 resize-none"
          style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
        />
      </label>

      <label className="block mb-3">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: B.muted }}>Status</span>
        <select
          value={form.status}
          onChange={set('status')}
          className="w-full text-xs rounded-md px-2 py-1.5"
          style={{ background: '#fff', border: `1px solid ${B.border}`, color: B.navy }}
        >
          <option value="draft">Draft (hidden)</option>
          <option value="open">Open (RSVPs accepted)</option>
        </select>
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={busy || !form.conference_name || !form.start_date || !form.end_date}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] disabled:opacity-40"
        style={{ background: accent, color: '#fff' }}
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Create Room
      </button>
    </div>
  );
}