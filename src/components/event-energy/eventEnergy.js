import { useEffect, useState } from 'react';
import { parseISO } from 'date-fns';

// Live-ticking clock shared by every hype chip on a page, so multiple
// chips stay in sync without each spinning its own interval.
export function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

// Accepts both ISO datetimes (events) and date-only strings (rooms).
const toDate = (str, endOfDay = false) => {
  if (!str) return null;
  try {
    if (typeof str === 'string' && str.includes('T')) return parseISO(str);
    return new Date(`${str}T${endOfDay ? '23:59:59' : '00:00:00'}`);
  } catch {
    return null;
  }
};

export const phaseFromDates = (startStr, endStr, now = new Date()) => {
  const start = toDate(startStr);
  if (!start) return 'upcoming';
  const end = toDate(endStr, true) || new Date(start.getTime() + 3 * 3600 * 1000);
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'live';
};

export const countdownFromDates = (startStr, endStr, now = new Date()) => {
  const start = toDate(startStr);
  if (!start) return null;
  const end = toDate(endStr, true) || new Date(start.getTime() + 3 * 3600 * 1000);
  const phase = phaseFromDates(startStr, endStr, now);
  if (phase === 'live') {
    if (endStr) {
      const dayIdx = Math.floor((now - start) / 86400000) + 1;
      const total = Math.max(1, Math.floor((end - start) / 86400000) + 1);
      return { kind: 'live', label: `Happening now · Day ${dayIdx} of ${total}` };
    }
    return { kind: 'live', label: 'Happening now' };
  }
  if (phase === 'ended') return { kind: 'ended', label: 'Recently ended' };
  const diff = start - now;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days >= 1) return { kind: 'upcoming', label: `in ${days} day${days === 1 ? '' : 's'}` };
  if (hours >= 1) return { kind: 'upcoming', label: `in ${hours} hour${hours === 1 ? '' : 's'}` };
  const mins = Math.max(1, Math.floor(diff / 60000));
  return { kind: 'upcoming', label: `in ${mins} min` };
};