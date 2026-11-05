import { useMemo, useState } from 'react';
import { CalendarPlus, Check, UserPlus } from 'lucide-react';
import { CAMPUS_ROOMS } from '@/components/admin/timecard/scheduleConfig';
import { todayISO } from '@/components/admin/timecard/scheduleConfig';
import { DURATIONS, MEETING_KINDS, clashFor, startOf } from './meetingConfig';

const fieldClass =
  'w-full rounded border px-2.5 py-1.5 text-[13px] outline-none focus:ring-1 focus:ring-[#b87333]';
const fieldStyle = { background: '#fffdf9', borderColor: '#d9cbb6', color: '#1e3a5a' };

function Label({ children }) {
  return (
    <span className="mb-1 block text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#8f5c2c' }}>
      {children}
    </span>
  );
}

// The booking form: who, when, how long, and where — written the way a diary is written.
export default function MeetingBookForm({ roster, absences, meetings, onBook, me }) {
  const [title, setTitle] = useState('');
  const [kind, setKind] = useState('sync');
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(30);
  const [room, setRoom] = useState('');
  const [agenda, setAgenda] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [guest, setGuest] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const away = useMemo(() => {
    const names = new Set(absences.filter((row) => row.shift_date === date).map((row) => row.person));
    return [...names];
  }, [absences, date]);

  const toggle = (person) => {
    setError('');
    setAttendees((prev) =>
      prev.some((a) => a.email === person.email)
        ? prev.filter((a) => a.email !== person.email)
        : [...prev, person],
    );
  };

  const addGuest = () => {
    const name = guest.trim();
    if (!name) return;
    setAttendees((prev) => (prev.some((a) => a.name === name) ? prev : [...prev, { name, email: '' }]));
    setGuest('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Give the meeting a name so the diary reads.');
      return;
    }
    const start = startOf(date, time);
    if (!start) {
      setError('The day and the hour are both needed.');
      return;
    }
    if (attendees.length === 0) {
      setError('Add at least one person to the table.');
      return;
    }
    const emails = attendees.map((a) => a.email).filter(Boolean);
    const clash = clashFor(meetings, { start, duration: Number(duration), emails });
    if (clash) {
      setError(`${clash.attendees?.join(', ') || 'That table'} is already booked for “${clash.title}” at that hour.`);
      return;
    }
    setSaving(true);
    try {
      await onBook({
        title: title.trim(),
        kind,
        start_at: start.toISOString(),
        duration_minutes: Number(duration),
        room_key: room,
        agenda: agenda.trim(),
        attendees: attendees.map((a) => a.name),
        attendee_emails: emails,
        status: 'booked',
        booked_by_email: me?.email || '',
        booked_by_name: me?.full_name || '',
      });
      setTitle('');
      setAgenda('');
      setAttendees([]);
    } catch (err) {
      setError(err?.message || 'The booking could not be written.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="desk-face px-4 py-4">
      <div className="flex items-center gap-2">
        <CalendarPlus className="h-3.5 w-3.5" style={{ color: '#b87333' }} />
        <p className="font-heading text-[15px]" style={{ color: '#1e3a5a' }}>
          Book the room
        </p>
      </div>

      <div className="mt-3 space-y-2.5">
        <div>
          <Label>What is being decided</Label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Weekly editorial sync"
            className={fieldClass}
            style={fieldStyle}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Kind</Label>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={fieldClass} style={fieldStyle}>
              {Object.entries(MEETING_KINDS).map(([key, meta]) => (
                <option key={key} value={key}>{meta.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>Room</Label>
            <select value={room} onChange={(e) => setRoom(e.target.value)} className={fieldClass} style={fieldStyle}>
              <option value="">Not on campus</option>
              {CAMPUS_ROOMS.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>Day</Label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} style={fieldStyle} />
          </div>
          <div>
            <Label>Start</Label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass} style={fieldStyle} />
          </div>
          <div>
            <Label>Minutes</Label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className={fieldClass} style={fieldStyle}>
              {DURATIONS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Who is at the table</Label>
          <div className="flex flex-wrap gap-1.5">
            {roster.length === 0 && (
              <p className="text-[11px]" style={{ color: '#3a5b7c' }}>No team accounts to pick from — add a name below.</p>
            )}
            {roster.map((person) => {
              const on = attendees.some((a) => a.email === person.email);
              const isAway = away.includes(person.name);
              return (
                <button
                  key={person.email}
                  type="button"
                  onClick={() => toggle(person)}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors"
                  style={
                    on
                      ? { background: '#1e3a5a', color: '#faf8f5' }
                      : { background: '#fffdf9', color: '#1e3a5a', border: '1px solid #d9cbb6' }
                  }
                >
                  {on ? <Check className="h-3 w-3" /> : null}
                  {person.name}
                  {isAway && (
                    <span
                      className="ml-1 rounded-sm px-1 text-[9px] uppercase tracking-wider"
                      style={{ background: 'rgba(184,115,51,0.18)', color: '#8f5c2c' }}
                    >
                      away
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <input
              value={guest}
              onChange={(e) => setGuest(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addGuest();
                }
              }}
              placeholder="Guest name"
              className={fieldClass}
              style={fieldStyle}
            />
            <button
              type="button"
              onClick={addGuest}
              aria-label="Add the guest"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded"
              style={{ background: '#1e3a5a', color: '#faf8f5' }}
            >
              <UserPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          {attendees.length > 0 && (
            <p className="mt-1.5 text-[11px]" style={{ color: '#3a5b7c' }}>
              At the table: {attendees.map((a) => a.name).join(' · ')}
            </p>
          )}
        </div>

        <div>
          <Label>Agenda</Label>
          <textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            rows={2}
            placeholder="Three things to settle, in the order they matter."
            className={fieldClass}
            style={fieldStyle}
          />
        </div>

        {away.length > 0 && (
          <p className="text-[11px]" style={{ color: '#8f5c2c' }}>
            Away that day: {away.join(' · ')}
          </p>
        )}

        {error && (
          <p className="text-[11px] font-semibold" style={{ color: '#a3341f' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-60"
          style={{ background: '#8f5c2c', color: '#fdf8f0' }}
        >
          {saving ? 'Writing the diary…' : 'Book it'}
        </button>
      </div>
    </form>
  );
}