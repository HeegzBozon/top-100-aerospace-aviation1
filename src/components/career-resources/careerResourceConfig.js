import { ACCENTS } from '@/components/fellow-home/fellowHomeConfig';

export const RESOURCE_TYPES = [
  { key: 'guide', label: 'Guide' },
  { key: 'framework', label: 'Framework' },
  { key: 'pathway', label: 'Pathway' },
  { key: 'playbook', label: 'Playbook' },
  { key: 'article', label: 'Article' },
  { key: 'credential', label: 'Credential' },
];

export const LEVELS = [
  { key: 'all', label: 'All levels' },
  { key: 'entry', label: 'Entry' },
  { key: 'mid', label: 'Mid' },
  { key: 'senior', label: 'Senior' },
  { key: 'executive', label: 'Executive' },
];

export const typeLabel = (key) => (RESOURCE_TYPES.find((t) => t.key === key) || {}).label || key;
export const levelLabel = (key) => (LEVELS.find((l) => l.key === key) || {}).label || key;
export const accentForDomain = (domain) => (ACCENTS.find((a) => a.key === domain) || ACCENTS[0]).value;