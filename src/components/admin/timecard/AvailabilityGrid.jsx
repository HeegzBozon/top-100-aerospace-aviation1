import { useState } from 'react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import { WEEKDAYS } from '@/components/admin/timecard/scheduleConfig';

const FIELD = 'w-full rounded-lg px-2.5 py-1.5 text-sm outline-none focus:ring-1';
const fieldStyle = { background: '#0e141b', border: `1px solid ${TC.line}`, color: TC.ink };

const blankWeek = (rows) => {
  const byDay = new Map((rows || []).map((row) => [Number(row.weekday), row]));
  return WEEKDAYS.map((label, weekday) => ({
    weekday,
    label,
    start_time: byDay.get(weekday)?.start_time || '',
    end_time: byDay.get(weekday)?.end_time || '',
  }));
};

// Someone's general availability: one window per weekday, kept as rows of its own so
// the rota and the pattern never have to be reconciled by hand. Clearing both times
// takes the day off the pattern.
export default function AvailabilityGrid({ person = '', rows = [], people = [], onCancel, onSave }) {
  const [name, setName] = useState(person || people[0] || '');
  const [week, setWeek] = useState(() => blankWeek(rows));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setDay = (weekday, key, value) =>
    setWeek((prev) => prev.map((day) => (day.weekday === weekday ? { ...day, [key]: value } : day)));

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('Say whose availability this is.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave(name.trim(), week.filter((day) => day.start_time && day.end_time));
    } catch (err) {
      setError(err?.message || 'The availability could not be saved.');
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-2.5 rounded-xl p-3.5"
      style={{ background: TC.surface, border: `1px solid ${TC.copper}` }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: TC.gold }}>
          General availability
        </p>
        <p className="text-[10px]" style={{ color: TC.soft }}>
          The hours they are normally on. Absences are filed against a date instead.
        </p>
      </div>

      <label className="block sm:max-w-xs">
        <span className="text-[10px] uppercase tracking-wider" style={{ color: TC.soft }}>Person</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          list="availability-people"
          className={FIELD}
          style={fieldStyle}
          placeholder="Name"
        />
        <datalist id="availability-people">
          {people.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </label>

      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {week.map((day) => (
          <div key={day.weekday} className="flex items-center gap-1.5">
            <span className="w-9 text-[10px] font-semibold uppercase tracking-wider" style={{ color: TC.soft }}>
              {day.label}
            </span>
            <input
              type="time"
              value={day.start_time}
              onChange={(event) => setDay(day.weekday, 'start_time', event.target.value)}
              className={FIELD}
              style={fieldStyle}
            />
            <span className="text-[10px]" style={{ color: TC.soft }}>–</span>
            <input
              type="time"
              value={day.end_time}
              onChange={(event) => setDay(day.weekday, 'end_time', event.target.value)}
              className={FIELD}
              style={fieldStyle}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-xs" style={{ color: '#f2a1a1' }}>{error}</p>}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg px-3.5 py-2 text-xs font-semibold disabled:opacity-50"
          style={{ background: TC.copper, color: '#fff' }}
        >
          {saving ? 'Saving…' : 'Save availability'}
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