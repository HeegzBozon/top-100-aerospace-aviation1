import { B } from '@/components/fellow-home/fellowHomeConfig';
export { B };
export { COVERS } from '@/components/fellow-home/fellowHomeConfig';

// Meetup formats — mirrors the Event.experience_type enum subset that reads as a convening.
export const FORMATS = [
  { key: 'Meetup', label: 'Meetup' },
  { key: 'Workshop', label: 'Workshop' },
  { key: 'AMA', label: 'AMA' },
  { key: 'Social', label: 'Social' },
  { key: 'Celebration', label: 'Celebration' },
  { key: 'Office Hours', label: 'Office Hours' },
  { key: 'Mission Theatre', label: 'Mission Theatre' },
  { key: 'Live Build', label: 'Live Build' },
];

// Curated-access tiers. Scarcity is the mechanic, never open enrollment.
export const ACCESS_TIERS = [
  { key: 'Public', label: 'Open to all' },
  { key: 'Member', label: 'Members' },
  { key: 'Verified', label: 'Verified Fellows' },
  { key: 'Premium', label: 'Premium' },
];

// Verified asset library only — never user upload.
export const DEFAULT_COVER = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80';

export const formatLabel = (key) => (FORMATS.find((f) => f.key === key) || { label: key }).label;
export const tierLabel = (key) => (ACCESS_TIERS.find((t) => t.key === key) || ACCESS_TIERS[0]).label;