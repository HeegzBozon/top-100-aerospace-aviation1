import { useState } from 'react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import {
  CAMPUS_ROOMS,
  DATED_KINDS,
  KINDS,
  SHIFT_STATUSES,
  todayISO,
} from '@/components/admin/timecard/scheduleConfig';

const FIELD = 'w-full rounded-lg px-2.5 py-2 text-sm outline-none focus:ring-1';
const fieldStyle = { background: '#0e141b', border: `1px solid ${TC.line}`, color: TC.ink };

// One dated row of the rota: a shift on a campus room, or an absence the desk needs to
// see. Absences carry no room — the point of them is that the room is uncovered.
export default function ShiftForm({ row = null, day = '', onCancel, onSave }) {
  const [form, setForm] = useState(() => ({
    person: row?.person || '',
    kind: row?.kind && DATED_KINDS.includes(row.kind) ? row.kind : 'shift',
    shift_date: row?.shift_date || day || todayISO(),
    start_time: row?.start_time || '',
    end_time: row?.end_time || '',
    room_key: row?.room_key || '',
    event_title: row?.event_title || '',
    status: row?.status || 'scheduled',
    note: row?.note || '',
    timezone: row?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));
  const isShift = form.kind === 'shift';

  const submit = async (event) => {
    event.preventDefault();
    if (!form.person.trim()) {
      setError('Say who the row is for.');
      return;
    }
    if (!form.shift_date) {
      setError('Give the row its date.');
      return;
    }
    setError('');
    setSaving(true);
    const payload = {
      person: form.person.trim(),
      kind: form.kind,
      shift_date: form.shift_date,
      start_time: isShift ? form.start_time : '',
      end_time: isShift ? form.end_time : '',
      room_key: isShift ? form.room_key : '',
      event_title: isShift ? form.event_title.trim() : '',
      status: isShift ? form.status : 'scheduled',
      note: form.note.trim(),
      timezone: form.timezone,
    };
    try {
      await onSave(payload);
    } catch (err) {
      setError(err?.message || 'The row could not be saved.');
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-2.5 rounded-xl p-3.5"
      style={{ background: TC.surface, border: `1px solid ${TC.copper}` }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: TC.gold }}>
          {row?.id ? 'Edit rota row' : 'Add to the rota'}
        </p>
        <div className="flex items-center gap-1">
          {DATED_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, kind }))}
              className="rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors"
              style={
                form.kind === kind
                  ? { background: KINDS[kind].tone, color: '#0b1219' }
                  : { background: 'transparent', color: TC.soft, border: `1px solid ${TC.line}` }
              }
            >
              {KINDS[kind].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Person</span>
          <input value={form.person} onChange={set('person')} className={FIELD} style={fieldStyle} placeholder="Name" />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Date</span>
          <input type="date" value={form.shift_date} onChange={set('shift_date')} className={FIELD} style={fieldStyle} required />
        </label>

        {isShift && (
          <>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>From</span>
              <input type="time" value={form.start_time} onChange={set('start_time')} className={FIELD} style={fieldStyle} />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>To</span>
              <input type="time" value={form.end_time} onChange={set('end_time')} className={FIELD} style={fieldStyle} />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Posted to</span>
              <select value={form.room_key} onChange={set('room_key')} className={FIELD} style={fieldStyle}>
                <option value="">No room</option>
                {CAMPUS_ROOMS.map((room) => (
                  <option key={room.key} value={room.key}>{room.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Status</span>
              <select value={form.status} onChange={set('status')} className={FIELD} style={fieldStyle}>
                {SHIFT_STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Event covered</span>
              <input
                value={form.event_title}
                onChange={set('event_title')}
                className={FIELD}
                style={fieldStyle}
                placeholder="STAR Summit keynote — holding the expo floor"
              />
            </label>
          </>
        )}

        <label className="block sm:col-span-2">
          <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Note</span>
          <input
            value={form.note}
            onChange={set('note')}
            className={FIELD}
            style={fieldStyle}
            placeholder={isShift ? 'What the shift is for, or who is on with them' : 'Who is covering, and what is outstanding'}
          />
        </label>
      </div>

      {error && <p className="text-xs" style={{ color: '#f2a1a1' }}>{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
          style={{ background: TC.copper, color: '#fff' }}
        >
          {saving ? 'Saving…' : row?.id ? 'Save changes' : 'Add to rota'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-3.5 py-2 text-xs font-medium"
          style={{ background: 'transparent', color: TC.soft, border: `1px solid ${TC.line}` }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}