// The schedule's own furniture: which campus rooms a shift can be posted to, the kinds
// of row the rota holds, and the week arithmetic the board is drawn with. A shift and an
// absence are dated; general availability is one row per weekday and carries no date.

import { COLONY_ROOMS } from '@/components/colony/colonyZones';

export const CAMPUS_ROOMS = Object.entries(COLONY_ROOMS).map(([key, room]) => ({
  key,
  label: room.label,
}));

export const roomLabel = (key) => CAMPUS_ROOMS.find((room) => room.key === key)?.label || key || '';

export const KINDS = {
  shift: { label: 'Shift', tone: '#8fd3e8' },
  vacation: { label: 'Vacation', tone: '#c9a87c' },
  sick: { label: 'Sick', tone: '#f2a1a1' },
  out: { label: 'Out', tone: '#a8bed2' },
};

export const DATED_KINDS = ['shift', 'vacation', 'sick', 'out'];
export const AWAY_KINDS = ['vacation', 'sick', 'out'];
export const SHIFT_STATUSES = ['scheduled', 'worked', 'covered', 'cancelled'];

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const isoOf = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export const dateOf = (iso) => new Date(`${iso}T12:00:00`);

// The rota is read in the reader's own day, not in UTC: a board opened at nine in the
// evening must still mark tonight's date as today.
export const todayISO = () => isoOf(new Date());

export const addDays = (iso, days) => {
  const date = dateOf(iso);
  date.setDate(date.getDate() + days);
  return isoOf(date);
};

// The week runs Monday to Sunday, which is how the board is drawn and how weekday
// numbers on availability rows are counted.
export const mondayOf = (iso) => {
  const date = dateOf(iso);
  return addDays(iso, -((date.getDay() + 6) % 7));
};

export const weekDays = (iso) => Array.from({ length: 7 }, (_, i) => addDays(mondayOf(iso), i));

export const dayShort = (iso) => dateOf(iso).toLocaleDateString(undefined, { weekday: 'short' });

export const dayNum = (iso) => dateOf(iso).getDate();

export const weekLabel = (iso) => {
  const days = weekDays(iso);
  const from = dateOf(days[0]);
  const to = dateOf(days[6]);
  return `${from.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${to.toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric' },
  )}`;
};

export const minutesBetween = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const minutes = eh * 60 + em - (sh * 60 + sm);
  return minutes > 0 ? minutes : 0;
};

export const timeLabel = (row) => {
  if (row?.start_time && row?.end_time) return `${row.start_time}–${row.end_time}`;
  return row?.start_time || row?.end_time || 'all day';
};

const byStart = (a, b) => String(a.start_time || '').localeCompare(String(b.start_time || ''));

export const shiftsOn = (rows, iso) =>
  rows.filter((row) => row.kind === 'shift' && row.shift_date === iso).sort(byStart);

export const awayOn = (rows, iso) =>
  rows.filter((row) => AWAY_KINDS.includes(row.kind) && row.shift_date === iso);

export const awayInWeek = (rows, days) =>
  days.flatMap((iso) => awayOn(rows, iso).map((row) => ({ ...row, iso }))).sort((a, b) => a.iso.localeCompare(b.iso));

export const peopleOf = (rows) =>
  [...new Set(rows.filter((row) => row.person).map((row) => row.person))].sort((a, b) => a.localeCompare(b));

export const availabilityOf = (rows, person) =>
  rows
    .filter((row) => row.kind === 'availability' && row.person === person)
    .sort((a, b) => Number(a.weekday) - Number(b.weekday));

// Which rooms have someone on them this week, and how many shifts each is carrying.
export const roomCoverage = (rows, days) => {
  const counts = new Map();
  days.forEach((iso) =>
    shiftsOn(rows, iso).forEach((row) => {
      if (!row.room_key) return;
      counts.set(row.room_key, (counts.get(row.room_key) || 0) + 1);
    }),
  );
  return [...counts.entries()]
    .map(([key, count]) => ({ key, label: roomLabel(key), count }))
    .sort((a, b) => b.count - a.count);
};

export const availabilityLine = (rows) =>
  rows
    .map((row) => `${WEEKDAYS[Number(row.weekday)] || '?'} ${timeLabel(row)}`)
    .join(' · ');