// The arithmetic and shape of an imported session, kept apart from the sheet that draws
// it. A session carries two figures that must never be confused: the elapsed time the log
// reported, and the split across the jobs inside it, which is an allocation.

import { CATEGORIES, today } from '@/components/admin/timecard/timecardConfig';

export const minutesLabel = (minutes) => {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest} m`;
  return rest ? `${hours} h ${rest} m` : `${hours} h`;
};

export const hoursFromMinutes = (minutes) => Math.round(((Number(minutes) || 0) / 60) * 100) / 100;

export const rangeLabel = (start, end) => {
  if (start && end) return `${start} – ${end}`;
  if (start) return `from ${start}`;
  if (end) return `to ${end}`;
  return '';
};

// What the sheet opens on: the reader's draft, with every figure a person can still change.
export const reviewOf = (draft = {}) => ({
  session_date: draft.session_date || today(),
  start_time: draft.start_time || '',
  end_time: draft.end_time || '',
  timezone: draft.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || '',
  duration_minutes: Math.max(0, Math.round(Number(draft.duration_minutes) || 0)),
  description: draft.summary || '',
  payee: draft.person || '',
  project: draft.project || '',
  event_title: draft.event_title || '',
  rooms_worked: [],
  category: CATEGORIES.includes(draft.category) ? draft.category : 'editorial',
  rate: '',
  billable: true,
  status: 'submitted',
  notes: draft.notes || '',
  tasks: (Array.isArray(draft.tasks) ? draft.tasks : []).map((task) => ({
    label: task?.label || '',
    minutes: Math.max(0, Math.round(Number(task?.minutes) || 0)),
    estimated: task?.estimated !== false,
    note: task?.note || '',
  })),
  deliverables: (Array.isArray(draft.deliverables) ? draft.deliverables : []).join('\n'),
  source_label: draft.source_label || '',
  source_text: draft.source_text || '',
  fingerprint: draft.fingerprint || '',
});

export const keptTasks = (review) =>
  (review.tasks || []).filter((task) => task.label.trim() || Number(task.minutes) > 0);

export const splitMinutes = (review) =>
  keptTasks(review).reduce((sum, task) => sum + (Number(task.minutes) || 0), 0);

// What leaves the sheet: the ledger record, with the session's own clock kept beside the
// hours it works out to.
export const payloadOf = (review) => {
  const hours = hoursFromMinutes(review.duration_minutes);
  const rate = Number(review.rate) || 0;
  const sessionAt = (time) => (review.session_date && time ? `${review.session_date}T${time}` : '');

  return {
    kind: 'time',
    source: 'worklog',
    entry_date: review.session_date,
    description: review.description.trim(),
    payee: review.payee.trim(),
    project: review.project.trim(),
    category: review.category,
    hours,
    rate_cents: Math.round(rate * 100),
    amount_cents: Math.round(hours * rate * 100),
    billable: !!review.billable,
    reimbursable: false,
    status: review.status,
    notes: review.notes.trim(),
    session_start: sessionAt(review.start_time),
    session_end: sessionAt(review.end_time),
    timezone: review.timezone.trim(),
    duration_minutes: Math.round(Number(review.duration_minutes) || 0),
    task_lines: keptTasks(review).map((task) => ({
      label: task.label.trim(),
      minutes: Math.round(Number(task.minutes) || 0),
      estimated: !!task.estimated,
      note: task.note.trim(),
    })),
    deliverables: review.deliverables
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    event_title: (review.event_title || '').trim(),
    rooms_worked: (review.rooms_worked || [])
      .filter((room) => room.room_key)
      .map((room) => ({ room_key: room.room_key, minutes: Math.round(Number(room.minutes) || 0) })),
    source_fingerprint: review.fingerprint,
    source_label: review.source_label,
    source_text: review.source_text,
  };
};