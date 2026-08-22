import { B } from '@/components/fellow-home/fellowHomeConfig';
export { B };

// Kanban lifecycle columns, shared across every lane.
export const STATUS_COLUMNS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'next_up', label: 'Next Up' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Shipped' },
];

export const HORIZONS = {
  h1: { label: 'Core', color: '#4a7fb5' },
  h2: { label: 'Growth', color: '#b06a45' },
  h3: { label: 'Future', color: '#7a8fa6' },
};

export const ITEM_TYPES = {
  feature: 'Feature',
  enhancement: 'Enhancement',
  bug: 'Bug',
  feedback: 'Feedback',
};

export const OKR_STATUS = {
  funnel: 'Funnel',
  analyzing: 'Analyzing',
  implementing: 'Implementing',
  done: 'Done',
};