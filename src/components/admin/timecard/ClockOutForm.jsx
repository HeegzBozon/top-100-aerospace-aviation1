import { useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { TC, CATEGORIES, STATUSES } from '@/components/admin/timecard/timecardConfig';
import RoomsWorkedField from '@/components/admin/timecard/RoomsWorkedField';
import { punchSession, clockLabel, durationLabel } from '@/components/admin/timecard/clockPunch';

const FIELD = 'w-full rounded-lg px-2.5 py-2 text-sm outline-none focus:ring-1';
const fieldStyle = { background: '#0e141b', border: `1px solid ${TC.line}`, color: TC.ink };

// Closing a shift. The punch already knows when the work began and ended, so the sheet
// only asks what the hours were for — then files the session with its own clock times.
export default function ClockOutForm({ punch, onCancel, onSave, onDiscard }) {
  // The moment the sheet opened is the moment the shift closed.
  const [finishedAt] = useState(() => new Date());
  const session = punchSession(punch, finishedAt);
  const [form, setForm] = useState({
    description: '',
    payee: '',
    project: '',
    rate: '',
    category: 'editorial',
    status: 'draft',
    notes: '',
    event_title: '',
    billable: true,
    rooms_worked: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!session.hours) {
      setError('The shift ran under a minute, so there are no hours to file.');
      return;
    }
    if (!form.description.trim()) {
      setError('Say what the hours were for.');
      return;
    }
    setError('');
    setSaving(true);
    const rate = Number(form.rate) || 0;
    const payload = {
      kind: 'time',
      entry_date: session.entry_date,
      description: form.description.trim(),
      payee: form.payee.trim(),
      project: form.project.trim(),
      category: form.category,
      status: form.status,
      notes: form.notes.trim(),
      billable: !!form.billable,
      reimbursable: false,
      event_title: form.event_title.trim(),
      rooms_worked: (form.rooms_worked || [])
        .filter((room) => room.room_key)
        .map((room) => ({ room_key: room.room_key, minutes: Math.round(Number(room.minutes) || 0) })),
      hours: session.hours,
      rate_cents: Math.round(rate * 100),
      amount_cents: Math.round(session.hours * rate * 100),
      source: 'manual',
      session_start: session.session_start,
      session_end: session.session_end,
      duration_minutes: session.duration_minutes,
      timezone: session.timezone,
    };
    try {
      await onSave(payload);
    } catch (err) {
      setError(err?.message || 'The session could not be filed.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" style={{ color: TC.gold }} />
        <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: TC.gold }}>
          Clock out
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          ['In', clockLabel(punch?.started_at)],
          ['Out', clockLabel(finishedAt)],
          ['Elapsed', durationLabel(session.duration_minutes)],
        ].map(([label, value], index) => (
          <div
            key={label}
            className="desk-face px-2.5 py-2"
            style={index === 2 ? { boxShadow: `inset 0 0 0 1px ${TC.copper}` } : undefined}
          >
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#8f5c2c' }}>{label}</p>
            <p className="mt-0.5 font-heading text-lg leading-none tabular-nums" style={{ color: '#1e3a5a' }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>What the hours were for</span>
          <input
            value={form.description}
            onChange={set('description')}
            className={FIELD}
            style={fieldStyle}
            placeholder="Editing Issue 43, the profile spreads"
          />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Worked by</span>
          <input value={form.payee} onChange={set('payee')} className={FIELD} style={fieldStyle} placeholder="Name" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Project</span>
          <input value={form.project} onChange={set('project')} className={FIELD} style={fieldStyle} placeholder="Issue 43" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Rate (per hour)</span>
          <input type="number" step="0.01" min="0" value={form.rate} onChange={set('rate')} className={FIELD} style={fieldStyle} placeholder="0.00" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Category</span>
          <select value={form.category} onChange={set('category')} className={FIELD} style={fieldStyle}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Status</span>
          <select value={form.status} onChange={set('status')} className={FIELD} style={fieldStyle}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-xs" style={{ color: TC.ink }}>
          <input type="checkbox" checked={!!form.billable} onChange={set('billable')} />
          Billable
        </label>
      </div>

      <RoomsWorkedField
        rooms={form.rooms_worked}
        hours={session.hours}
        onChange={(rooms) => setForm((prev) => ({ ...prev, rooms_worked: rooms }))}
      />

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Event covered</span>
        <input
          value={form.event_title}
          onChange={set('event_title')}
          className={FIELD}
          style={fieldStyle}
          placeholder="Leave blank when the hours were not held for an event"
        />
      </label>

      <label className="block">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Note</span>
        <textarea value={form.notes} onChange={set('notes')} rows={2} className={FIELD} style={fieldStyle} />
      </label>

      {error && <p className="text-xs" style={{ color: '#f2a1a1' }}>{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
          style={{ background: TC.copperDeep, color: '#fdf8f0' }}
        >
          {saving ? 'Filing…' : 'Clock out & file'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3.5 py-2 text-xs font-medium"
          style={{ background: 'transparent', color: TC.soft, border: `1px solid ${TC.line}` }}
        >
          Stay clocked in
        </button>
        {onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            className="desk-key desk-key-quiet ml-auto"
            title="Scrap this shift without filing any hours"
          >
            <Trash2 className="h-3 w-3" /> Scrap the shift
          </button>
        )}
      </div>
    </form>
  );
}