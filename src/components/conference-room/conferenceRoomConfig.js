import { parseISO } from 'date-fns';
import { B, accentValue } from '@/components/fellow-home/fellowHomeConfig';
export { B, accentValue };

// Room lifecycle. 'draft' is hidden from non-admins via RLS.
export const ROOM_STATUS = {
  draft: { label: 'Draft', color: B.muted },
  open: { label: 'Open', color: '#4a7fb5' },
  live: { label: 'Live', color: '#b06a45' },
  closed: { label: 'Closed', color: B.muted },
  archived: { label: 'Archived', color: B.muted },
};

// The eight domain accents, reused from the governed set.
export const DISCIPLINES = [
  { key: 'space_rd', label: 'Space R&D' },
  { key: 'commercial_aviation', label: 'Commercial Aviation' },
  { key: 'defense', label: 'Defense' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'operations', label: 'Operations' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'policy', label: 'Policy' },
  { key: 'entrepreneurship', label: 'Entrepreneurship' },
];

export const disciplineLabel = (key) =>
  (DISCIPLINES.find((d) => d.key === key) || {}).label || key;

export const statusMeta = (key) => ROOM_STATUS[key] || { label: key, color: B.muted };

// Maps a room's lifecycle status to a kanban card phase.
export const phaseForStatus = (status) => {
  if (status === 'live') return 'live';
  if (['closed', 'archived'].includes(status)) return 'done';
  return 'upcoming';
};

// Date-aware phase derivation. Rooms whose governance status is 'open' or
// 'live' auto-progress through the board by date: upcoming before the start
// date, live during the event window, done once it ends. 'draft' stays
// upcoming (hidden from non-admins via RLS); 'closed'/'archived' are done.
// This reorganizes the board without mutating the lifecycle status record.
export const phaseForRoom = (room, now = new Date()) => {
  const status = room?.status;
  if (['closed', 'archived'].includes(status)) return 'done';
  if (status === 'draft') return 'upcoming';
  if (room?.start_date) {
    const start = new Date(`${room.start_date}T00:00:00`);
    const end = room.end_date ? new Date(`${room.end_date}T23:59:59`) : null;
    if (!isNaN(start.getTime())) {
      if (now < start) return 'upcoming';
      if (end && now > end) return 'done';
      return 'live';
    }
  }
  return status === 'live' ? 'live' : 'upcoming';
};

// Board view dimensions. Each extractor returns a stable lane key for a room.
export const CONFERENCE_VIEWS = [
  { key: 'lifecycle', label: 'Seasonal' },
  { key: 'domain', label: 'Domain' },
  { key: 'series', label: 'Series' },
  { key: 'region', label: 'Region' },
  { key: 'attending', label: 'Attending' },
];

// Resolves the governed accent color for a room's domain_focus.
export const domainAccent = (key) => accentValue(key);

// Countdown / day-of chip. Returns null when no useful chip applies.
export const roomCountdown = (room, now = new Date()) => {
  if (!room.start_date) return null;
  let start; let end;
  try {
    start = parseISO(room.start_date);
    end = room.end_date ? parseISO(room.end_date) : null;
  } catch { return null; }
  if (end && now >= start && now <= end) {
    const dayIdx = Math.floor((now - start) / 86400000) + 1;
    const total = Math.floor((end - start) / 86400000) + 1;
    return { kind: 'live', label: `Day ${dayIdx} of ${total}` };
  }
  if (now < start) {
    const days = Math.ceil((start - now) / 86400000);
    if (days <= 30) return { kind: 'upcoming', label: `in ${days} day${days === 1 ? '' : 's'}` };
  }
  return null;
};