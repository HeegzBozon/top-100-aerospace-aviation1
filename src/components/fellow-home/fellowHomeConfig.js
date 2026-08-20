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

export const ACCENTS = [
  { key: 'rose_gold', label: 'Rose Gold', value: '#c9a87c' },
  { key: 'copper', label: 'Copper', value: '#b06a45' },
  { key: 'nasa_blue', label: 'NASA Blue', value: '#4a7fb5' },
  { key: 'sand', label: 'Sand', value: '#a89170' },
  { key: 'slate', label: 'Slate', value: '#6b7f95' },
];

export const COVERS = [
  { key: 'none', label: 'None', url: null },
  { key: 'orbit', label: 'Orbit', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80' },
  { key: 'launch', label: 'Launch', url: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1600&q=80' },
  { key: 'runway', label: 'Runway', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=80' },
  { key: 'lunar', label: 'Lunar', url: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?w=1600&q=80' },
  { key: 'horizon', label: 'Horizon', url: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1600&q=80' },
];

export const MODULES = [
  { key: 'eight', label: 'The Eight' },
  { key: 'wall', label: 'Endorsements' },
];

export const DEFAULT_MODULE_ORDER = MODULES.map((m) => m.key);

export const accentValue = (key) => (ACCENTS.find((a) => a.key === key) || ACCENTS[0]).value;
export const coverUrl = (key) => (COVERS.find((c) => c.key === key) || COVERS[0]).url;

export const orderedModules = (order) => {
  const valid = (order || []).filter((k) => DEFAULT_MODULE_ORDER.includes(k));
  return [...valid, ...DEFAULT_MODULE_ORDER.filter((k) => !valid.includes(k))];
};