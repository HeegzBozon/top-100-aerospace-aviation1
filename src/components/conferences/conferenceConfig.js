import { format, parseISO } from 'date-fns';
import { B, COVERS, accentValue, coverUrl } from '@/components/fellow-home/fellowHomeConfig';
import {
  DISCIPLINES,
  disciplineLabel,
  domainAccent,
  phaseForRoom,
  roomCountdown,
  statusMeta,
} from '@/components/conference-room/conferenceRoomConfig';

// Conferences, read on the institution's own terms: one record per conference, its focus
// areas as the rooms inside it, and the same governed palette every other surface uses.
// Nothing here reads a transaction, availability or sponsorship field — the board is an
// editorial index of the circuit, not a placement.
export {
  B,
  COVERS,
  accentValue,
  coverUrl,
  DISCIPLINES,
  disciplineLabel,
  domainAccent,
  phaseForRoom,
  roomCountdown,
  statusMeta,
};

// The two audiences the surface is read by. Attendee is the default; Host is the
// workspace, and it asks for approval before it opens.
export const CONFERENCE_MODES = [
  { key: 'attend', label: 'Attend', to: '/conferences' },
  { key: 'host', label: 'Host', to: '/conferences/host' },
];

export const CONFERENCES_HREF = '/conferences';
export const HOST_HREF = '/conferences/host';
export const HOST_APPLY_HREF = '/conferences/host/apply';

export const conferenceHref = (id) => `/conferences/${id}`;

// A conference is on the circuit once it stops being a draft. Drafts belong to the host.
export const isOnCircuit = (room) => !!room && room.status !== 'draft';

// The date line, in the register the rest of the house prints dates in.
export const dateRangeLabel = (room) => {
  if (!room?.start_date) return '';
  try {
    const start = parseISO(room.start_date);
    const end = room.end_date ? parseISO(room.end_date) : null;
    if (!end) return format(start, 'MMM d, yyyy');
    if (format(start, 'MMM yyyy') === format(end, 'MMM yyyy')) {
      return `${format(start, 'MMM d')}–${format(end, 'd, yyyy')}`;
    }
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  } catch {
    return '';
  }
};

export const placeLabel = (room) => [room?.city, room?.country].filter(Boolean).join(', ');

// The cover a conference is published under — drawn from the verified asset library.
export const coverFor = (key) => coverUrl(key || 'none');

// A short, human reading of where a conference stands, in the calendar rather than in
// the database: upcoming, live, done.
export const circuitLabel = (room) => {
  const phase = phaseForRoom(room);
  if (phase === 'live') return 'In session';
  if (phase === 'done') return 'Concluded';
  return 'Ahead';
};