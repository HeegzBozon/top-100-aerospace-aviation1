export const PURPOSES = [
  { key: 'intro', label: 'Introduction' },
  { key: 'demo', label: 'Demo' },
  { key: 'follow_up', label: 'Follow-up' },
  { key: 'catch_up', label: 'Catch-up' },
];
export const FORMATS = [
  { key: 'video', label: 'Video call' },
  { key: 'in_person', label: 'In person' },
  { key: 'colony', label: 'In the Colony' },
];
export const label = (list, key) => list.find((x) => x.key === key)?.label || key;
export const when = (iso) => new Date(iso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });