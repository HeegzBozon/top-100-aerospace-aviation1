// Governed personalization: every expressive option is a curated variant, never a free field.

export const B = {
  navy: '#1e3a5a',
  navyDeep: '#16293f',
  gold: '#c9a87c',
  cream: '#faf8f5',
  sand: '#efe7dc',
  border: 'rgba(30,58,90,0.12)',
  muted: 'rgba(30,58,90,0.58)',
};

// Eight domain accents, one per discipline. Derived from the domain set, never arbitrary.
export const ACCENTS = [
  { key: 'space_rd', label: 'Orbital', value: '#4a7fb5' },
  { key: 'commercial_aviation', label: 'Horizon', value: '#5b8ca6' },
  { key: 'defense', label: 'Slate', value: '#4d5f6f' },
  { key: 'manufacturing', label: 'Copper', value: '#b06a45' },
  { key: 'operations', label: 'Sandstone', value: '#8a7f6a' },
  { key: 'engineering', label: 'Steel', value: '#7a8fa6' },
  { key: 'policy', label: 'Bronze', value: '#705c4a' },
  { key: 'entrepreneurship', label: 'Rose Gold', value: '#c9a87c' },
];

export const DEFAULT_ACCENT = 'entrepreneurship';

export const COVERS = [
  { key: 'none', label: 'None', url: null },
  { key: 'orbit', label: 'Orbit', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80' },
  { key: 'launch', label: 'Launch', url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1600&q=80' },
  { key: 'runway', label: 'Runway', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80' },
  { key: 'lunar', label: 'Lunar', url: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=1600&q=80' },
  { key: 'horizon', label: 'Horizon', url: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1600&q=80' },
];

// Locked modules hold positions 1 and 2 and are never reorderable.
export const LOCKED_MODULES = [
  { key: 'identity', label: 'Identity header' },
  { key: 'verification', label: 'Verification and influence' },
];

export const MODULES = [
  { key: 'eight', label: 'The Eight' },
  { key: 'wall', label: 'Endorsements' },
  { key: 'flightography', label: 'Flightography' },
];

export const DEFAULT_MODULE_ORDER = MODULES.map((m) => m.key);

export const accentValue = (key) =>
  (ACCENTS.find((a) => a.key === key) || ACCENTS.find((a) => a.key === DEFAULT_ACCENT)).value;

export const accentForDiscipline = (discipline) =>
  ACCENTS.some((a) => a.key === discipline) ? discipline : DEFAULT_ACCENT;

export const coverUrl = (key) => (COVERS.find((c) => c.key === key) || COVERS[0]).url;

export const moduleLabel = (key) =>
  ([...LOCKED_MODULES, ...MODULES].find((m) => m.key === key) || {}).label || key;

// Reorderable modules only. Locked positions are rendered structurally, never in this list.
export const orderedModules = (order) => {
  const valid = (order || []).filter((k) => DEFAULT_MODULE_ORDER.includes(k));
  const deduped = valid.filter((k, i) => valid.indexOf(k) === i);
  return [...deduped, ...DEFAULT_MODULE_ORDER.filter((k) => !deduped.includes(k))];
};