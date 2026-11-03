// The diary's own arithmetic: when a booking starts and ends, whether it collides with
// another, and who is away that day. Kept out of the components so the desk, the form and
// the list all read a clash the same way.

export const DURATIONS = [15, 30, 45, 60, 90];

export const MEETING_KINDS = {
  sync: { label: 'Team sync', tone: '#8fd3e8' },
  review: { label: 'Review', tone: '#c9a87c' },
  one_to_one: { label: 'One to one', tone: '#8fd3a8' },
  standup: { label: 'Standup', tone: '#a8bed2' },
  other: { label: 'Other', tone: '#9db2c5' },
};

export const startOf = (iso, time) => {
  if (!iso || !time) return null;
  const date = new Date(`${iso}T${time}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const startTimeOf = (startAt) => {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return '09:00';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const dateOfStart = (startAt) => {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const endsAt = (meeting) =>
  new Date(new Date(meeting.start_at).getTime() + (Number(meeting.duration_minutes) || 30) * 60000);

export const rangeLabel = (meeting) => {
  const start = new Date(meeting.start_at);
  if (Number.isNaN(start.getTime())) return 'Time to be set';
  const end = endsAt(meeting);
  const time = (d) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${time(start)}–${time(end)}`;
};

export const dayLabelOf = (startAt) => {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return 'Date to be set';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};

export const timeLabelOf = (startAt) => {
  const date = new Date(startAt);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

// Two bookings collide when the same person is expected at both and the clocks overlap.
export const clashFor = (meetings, { start, duration, emails }) => {
  if (!start || !emails?.length) return null;
  const from = start.getTime();
  const to = from + duration * 60000;
  const mine = new Set(emails);
  return (
    meetings.find((meeting) => {
      if (meeting.status !== 'booked') return false;
      const theirs = meeting.attendee_emails || [];
      if (!theirs.some((email) => mine.has(email))) return false;
      const theirStart = new Date(meeting.start_at).getTime();
      if (Number.isNaN(theirStart)) return false;
      const theirEnd = theirStart + (Number(meeting.duration_minutes) || 30) * 60000;
      return from < theirEnd && theirStart < to;
    }) || null
  );
};

// Who is already away on the day being booked.
export const awayOnDate = (absences, iso, emails) => {
  if (!iso) return [];
  const mine = new Set(emails || []);
  return absences.filter((row) => row.shift_date === iso && row.person && (!mine.size || mine.has(row.person_email) || mine.has(row.person)));
};