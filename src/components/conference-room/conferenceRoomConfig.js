import { B } from '@/components/fellow-home/fellowHomeConfig';
export { B };

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

// Board view dimensions. Each extractor returns a stable lane key for a room.
export const CONFERENCE_VIEWS = [
  { key: 'lifecycle', label: 'Lifecycle' },
  { key: 'domain', label: 'Domain' },
  { key: 'series', label: 'Series' },
  { key: 'region', label: 'Region' },
  { key: 'attending', label: 'Attending' },
];