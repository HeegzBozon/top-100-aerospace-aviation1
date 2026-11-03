import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, CalendarPlus, ChevronLeft, ChevronRight, RefreshCw, Repeat } from 'lucide-react';
import { TC } from '@/components/admin/timecard/timecardConfig';
import {
  addDays,
  availabilityLine,
  availabilityOf,
  awayInWeek,
  mondayOf,
  peopleOf,
  roomCoverage,
  todayISO,
  weekDays,
  weekLabel,
} from '@/components/admin/timecard/scheduleConfig';
import AwayBand from '@/components/admin/timecard/AwayBand';
import WeekBoard from '@/components/admin/timecard/WeekBoard';
import ShiftForm from '@/components/admin/timecard/ShiftForm';
import AvailabilityGrid from '@/components/admin/timecard/AvailabilityGrid';

// The rota: who is on, in which room, for what — and who is away. General availability
// is the pattern the week is planned against; absences are filed against a date.
export default function SchedulePanel() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [anchor, setAnchor] = useState(() => todayISO());
  const [editor, setEditor] = useState(null);
  const [availabilityFor, setAvailabilityFor] = useState(null);

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const page = await base44.entities.WorkShift.filter({}, { sort: '-shift_date', limit: 500 });
      setRows(page?.items || []);
      setState('ready');
    } catch (err) {
      setError(err?.message || 'The rota could not be read.');
      setState('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => weekDays(anchor), [anchor]);
  const away = useMemo(() => awayInWeek(rows, days), [rows, days]);
  const coverage = useMemo(() => roomCoverage(rows, days), [rows, days]);
  const people = useMemo(() => peopleOf(rows), [rows]);
  const withAvailability = useMemo(
    () => people.filter((person) => availabilityOf(rows, person).length > 0),
    [people, rows],
  );

  const save = async (payload) => {
    if (editor?.id) {
      const updated = await base44.entities.WorkShift.update(editor.id, payload);
      setRows((prev) => prev.map((row) => (row.id === editor.id ? { ...row, ...updated } : row)));
    } else {
      const created = await base44.entities.WorkShift.create(payload);
      setRows((prev) => [...prev, created]);
    }
    setEditor(null);
  };

  const remove = async (row) => {
    if (!window.confirm(`Remove ${row.person} — ${row.kind} on ${row.shift_date}?`)) return;
    await base44.entities.WorkShift.delete(row.id);
    setRows((prev) => prev.filter((item) => item.id !== row.id));
  };

  // The pattern is rewritten whole for one person, so a cleared day leaves no row behind.
  const saveAvailability = async (person, week) => {
    await base44.entities.WorkShift.deleteMany({ kind: 'availability', person });
    const payload = week.map((day) => ({
      person,
      kind: 'availability',
      weekday: day.weekday,
      start_time: day.start_time,
      end_time: day.end_time,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    }));
    const created = payload.length ? await base44.entities.WorkShift.bulkCreate(payload) : [];
    setRows((prev) => [
      ...prev.filter((row) => !(row.kind === 'availability' && row.person === person)),
      ...(Array.isArray(created) ? created : []),
    ]);
    setAvailabilityFor(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setAnchor((prev) => addDays(mondayOf(prev), -7))}
            title="Previous week"
            className="rounded-lg p-1.5"
            style={{ background: 'rgba(255,255,255,0.06)', color: TC.ink, border: `1px solid ${TC.line}` }}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <p className="min-w-[9.5rem] text-center text-sm font-semibold tabular-nums" style={{ color: TC.ink }}>
            {weekLabel(anchor)}
          </p>
          <button
            onClick={() => setAnchor((prev) => addDays(mondayOf(prev), 7))}
            title="Next week"
            className="rounded-lg p-1.5"
            style={{ background: 'rgba(255,255,255,0.06)', color: TC.ink, border: `1px solid ${TC.line}` }}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setAnchor(todayISO())}
            className="ml-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
            style={{ color: TC.soft, border: `1px solid ${TC.line}` }}
          >
            This week
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', color: TC.ink, border: `1px solid ${TC.line}` }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Re-read
          </button>
          <button
            onClick={() => setAvailabilityFor({ person: people[0] || '' })}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ background: 'rgba(255,255,255,0.06)', color: TC.ink, border: `1px solid ${TC.line}` }}
          >
            <Repeat className="h-3.5 w-3.5" /> Availability
          </button>
          <button
            onClick={() => setEditor({ day: todayISO() })}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold"
            style={{ background: TC.copper, color: '#fff' }}
          >
            <CalendarPlus className="h-4 w-4" /> Add shift
          </button>
        </div>
      </div>

      {editor && (
        <ShiftForm
          row={editor.id ? editor : null}
          day={editor.day}
          onCancel={() => setEditor(null)}
          onSave={save}
        />
      )}

      {availabilityFor && (
        <AvailabilityGrid
          person={availabilityFor.person}
          people={people}
          rows={availabilityOf(rows, availabilityFor.person)}
          onCancel={() => setAvailabilityFor(null)}
          onSave={saveAvailability}
        />
      )}

      {state === 'loading' && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-6 text-sm"
          style={{ background: TC.surface, border: `1px solid ${TC.line}`, color: TC.soft }}
        >
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Reading the rota…
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-xl px-3 py-5" style={{ background: TC.surface, border: `1px solid ${TC.line}` }}>
          <p className="flex items-center gap-2 text-sm" style={{ color: '#f2a1a1' }}>
            <AlertCircle className="h-4 w-4" /> {error}
          </p>
          <button onClick={load} className="mt-2 text-xs underline" style={{ color: TC.gold }}>Try again</button>
        </div>
      )}

      {state === 'ready' && (
        <>
          <AwayBand away={away} coverage={coverage} />
          <WeekBoard days={days} rows={rows} today={todayISO()} onAdd={(iso) => setEditor({ day: iso })} onEdit={setEditor} onDelete={remove} />
        </>
      )}

      {state === 'ready' && rows.filter((row) => row.kind !== 'availability').length === 0 && (
        <div
          className="rounded-xl px-4 py-8 text-center"
          style={{ background: TC.surface, border: `1px dashed ${TC.line}` }}
        >
          <p className="text-sm font-semibold" style={{ color: TC.ink }}>The rota is empty.</p>
          <p className="mx-auto mt-1 max-w-md text-xs" style={{ color: TC.soft }}>
            Set each person's general availability first, then put shifts on the week — posting one to a campus room is
            what tells you which rooms are held for an event.
          </p>
        </div>
      )}

      {withAvailability.length > 0 && (
        <div className="rounded-xl px-3 py-2.5" style={{ background: TC.surface, border: `1px solid ${TC.line}` }}>
          <p className="text-[9px] uppercase tracking-[0.16em]" style={{ color: TC.soft }}>General availability</p>
          <ul className="mt-1 space-y-1">
            {withAvailability.map((person) => (
              <li key={person} className="flex flex-wrap items-baseline gap-2 text-[11px]">
                <span className="font-semibold" style={{ color: TC.ink }}>{person}</span>
                <span className="min-w-0 flex-1" style={{ color: '#a8bed2' }}>
                  {availabilityLine(availabilityOf(rows, person))}
                </span>
                <button
                  onClick={() => setAvailabilityFor({ person })}
                  className="text-[10px] underline"
                  style={{ color: TC.gold }}
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}