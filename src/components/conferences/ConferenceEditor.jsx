import { useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { B, COVERS, DISCIPLINES } from './conferenceConfig';

const STATUS_CHOICES = [
  { key: 'draft', label: 'Draft — hidden from the circuit' },
  { key: 'open', label: 'Open — accepting declarations' },
  { key: 'closed', label: 'Closed — the record is final' },
];

const blankForm = {
  conference_name: '',
  conference_series: '',
  organizer: '',
  venue: '',
  city: '',
  country: '',
  start_date: '',
  end_date: '',
  official_url: '',
  registration_url: '',
  domain_focus: 'space_rd',
  cover_key: 'none',
  description: '',
  status: 'draft',
  focus_areas: '',
};

const fromRoom = (room) => ({
  conference_name: room.conference_name || '',
  conference_series: room.conference_series || '',
  organizer: room.organizer || '',
  venue: room.venue || '',
  city: room.city || '',
  country: room.country || '',
  start_date: room.start_date || '',
  end_date: room.end_date || '',
  official_url: room.official_url || '',
  registration_url: room.registration_url || '',
  domain_focus: room.domain_focus || 'space_rd',
  cover_key: room.cover_key || 'none',
  description: room.description || '',
  // 'live' is reached by the calendar, and an archived record is final: both are edited as
  // the standing they read as, so the select never opens on a blank option.
  status: room.status === 'archived' ? 'closed' : room.status === 'live' ? 'open' : room.status || 'draft',
  focus_areas: (room.focus_areas || []).map((area) => area.label).join('\n'),
});

// The conference as the host writes it. Every save is checked by the server against the
// host's approval — this form is the authoring surface, never the permission.
export default function ConferenceEditor({ room, onSaved, onCancel }) {
  const [form, setForm] = useState(() => (room ? fromRoom(room) : blankForm));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const ready = form.conference_name.trim() && form.start_date && form.end_date;

  const save = async () => {
    if (!ready) return;
    setBusy(true);
    setError('');
    try {
      const response = await base44.functions.invoke('conferenceService', {
        action: 'saveConference',
        room_id: room?.id,
        ...form,
        focus_areas: form.focus_areas.split('\n').map((line) => line.trim()).filter(Boolean),
      });
      const data = response?.data ?? response;
      if (data?.error) throw new Error(data.error);
      onSaved?.(data?.room);
    } catch (saveError) {
      setError(saveError?.message || 'The conference could not be saved. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-sm p-3.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>
        {room ? 'Edit conference' : 'New conference'}
      </p>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Field label="Name *" value={form.conference_name} onChange={set('conference_name')} placeholder="e.g. IAC 2027" />
        <Field label="Series" value={form.conference_series} onChange={set('conference_series')} placeholder="e.g. IAC" />
        <Field label="Organizer" value={form.organizer} onChange={set('organizer')} placeholder="Staging body" />
        <Field label="Venue" value={form.venue} onChange={set('venue')} placeholder="Convention centre" />
        <Field label="City" value={form.city} onChange={set('city')} />
        <Field label="Country" value={form.country} onChange={set('country')} />
        <Field label="Starts *" type="date" value={form.start_date} onChange={set('start_date')} />
        <Field label="Ends *" type="date" value={form.end_date} onChange={set('end_date')} />
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Select label="Domain" value={form.domain_focus} onChange={set('domain_focus')}>
          {DISCIPLINES.map((domain) => <option key={domain.key} value={domain.key}>{domain.label}</option>)}
        </Select>
        <Select label="Cover" value={form.cover_key} onChange={set('cover_key')}>
          {COVERS.map((cover) => <option key={cover.key} value={cover.key}>{cover.label}</option>)}
        </Select>
        <Field label="Official site" type="url" value={form.official_url} onChange={set('official_url')} placeholder="https://" />
        <Field label="Registration link" type="url" value={form.registration_url} onChange={set('registration_url')} placeholder="https://" />
      </div>

      <label className="mt-2 block">
        <span className="mb-1 block text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
          What this conference is
        </span>
        <textarea
          value={form.description}
          onChange={set('description')}
          rows={3}
          placeholder="The show, who it gathers, and what the rooms inside it are for."
          className="w-full resize-none rounded-sm px-2.5 py-2 text-[12.5px]"
          style={{ background: B.cream, border: `1px solid ${B.border}`, color: B.navy }}
        />
      </label>

      <label className="mt-2 block">
        <span className="mb-1 block text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
          Rooms inside it — one per line
        </span>
        <textarea
          value={form.focus_areas}
          onChange={set('focus_areas')}
          rows={3}
          placeholder={'On-orbit servicing\nLunar economy\nLaunch cadence'}
          className="w-full resize-none rounded-sm px-2.5 py-2 text-[12.5px]"
          style={{ background: B.cream, border: `1px solid ${B.border}`, color: B.navy }}
        />
      </label>

      <div className="mt-2">
        <Select label="Standing" value={form.status} onChange={set('status')}>
          {STATUS_CHOICES.map((choice) => <option key={choice.key} value={choice.key}>{choice.label}</option>)}
        </Select>
      </div>

      {error && <p className="mt-2 text-[11.5px] leading-relaxed" style={{ color: '#8c2f2f' }}>{error}</p>}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy || !ready}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] disabled:opacity-40"
          style={{ background: B.copper, color: '#fff' }}
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          {room ? 'Save conference' : 'Create conference'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{ color: B.muted }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-sm px-2.5 py-2 text-[12.5px]"
        style={{ background: B.cream, border: `1px solid ${B.border}`, color: B.navy }}
      />
    </label>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[9.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
        {label}
      </span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-sm px-2.5 py-2 text-[12.5px]"
        style={{ background: B.cream, border: `1px solid ${B.border}`, color: B.navy }}
      >
        {children}
      </select>
    </label>
  );
}