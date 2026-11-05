// The desk's clock. A punch is the moment a shift was started, kept on the machine the
// desk is worked from so a reload never loses it; clocking out turns that punch into the
// session record the ledger files.

const KEY = 'top100.timecard.punch';

const pad = (n) => String(n).padStart(2, '0');

export const readPunch = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const punch = JSON.parse(raw);
    return punch?.started_at ? punch : null;
  } catch {
    return null;
  }
};

export const writePunch = (punch) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(punch));
  } catch {
    // A browser that refuses storage is still allowed to punch the clock for the session.
  }
};

export const clearPunch = () => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // nothing to clear
  }
};

const minutesOf = (startedAt, finishedAt) =>
  Math.max(0, Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 60000));

// The running clock, read as hours and minutes on the key: 0:42, 3:07.
export const elapsedLabel = (startedAt, now = Date.now()) => {
  const minutes = minutesOf(startedAt, now);
  return `${Math.floor(minutes / 60)}:${pad(minutes % 60)}`;
};

export const durationLabel = (minutes = 0) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

export const clockLabel = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

// The punch written as the session the ledger keeps: the day it began, the clock times on
// that day, and the wall-clock minutes between them.
export const punchSession = (punch, finishedAt = new Date()) => {
  const start = new Date(punch?.started_at || finishedAt);
  const end = new Date(finishedAt);
  const day = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
  const minutes = minutesOf(start, end);
  return {
    entry_date: day,
    session_start: `${day}T${pad(start.getHours())}:${pad(start.getMinutes())}`,
    session_end: `${day}T${pad(end.getHours())}:${pad(end.getMinutes())}`,
    duration_minutes: minutes,
    hours: Math.round((minutes / 60) * 100) / 100,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};