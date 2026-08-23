import { B } from '@/components/fellow-home/fellowHomeConfig';

// Slide region registry. Identity and verification are locked to positions 1 and 2.
// Configurable slides: blurb, documents, eight, flightography — Fellow reorders and toggles.
export const SLIDE_REGIONS = [
  { key: 'identity', label: 'Identity', locked: true },
  { key: 'verification', label: 'Credential', locked: true },
  { key: 'blurb', label: 'Editorial', locked: false },
  { key: 'documents', label: 'Documents', locked: false },
  { key: 'eight', label: 'The Eight', locked: false },
  { key: 'flightography', label: 'Flightography', locked: false },
];

export const LOCKED_SLIDES = ['identity', 'verification'];
export const CONFIGURABLE_SLIDES = ['blurb', 'documents', 'eight', 'flightography'];
export const ALL_SLIDE_KEYS = [...LOCKED_SLIDES, ...CONFIGURABLE_SLIDES];

// Default roster surfaces all regions — the Fellow toggles off what they don't want.
export const DEFAULT_SLIDE_ORDER = ['identity', 'verification', 'blurb', 'documents', 'eight', 'flightography'];

export const AUTOPLAY_MODES = [
  { key: 'loop', label: 'Loop', description: 'Advance through all slides and repeat', icon: 'Repeat' },
  { key: 'stop_at_end', label: 'Stop at end', description: 'Advance once through, then stop', icon: 'Square' },
  { key: 'manual', label: 'Manual', description: 'No autoplay. Navigate with controls.', icon: 'Hand' },
];

export const DEFAULT_DWELL = 6;
export const MIN_DWELL = 3;

export const slideLabel = (key) =>
  SLIDE_REGIONS.find((r) => r.key === key)?.label || key;

// Resolves the effective slide order from settings. Locked slides always hold
// positions 1 and 2. Hidden configurable slides are excluded. Invalid keys
// are filtered. This is the client-side enforcement of the lock invariant.
export const resolveSlideOrder = (settings) => {
  const raw = settings?.slide_order;
  const hidden = new Set(settings?.slide_hidden || []);

  let configurable;
  if (Array.isArray(raw) && raw.length > 0) {
    const valid = raw.filter((k) => CONFIGURABLE_SLIDES.includes(k));
    const deduped = valid.filter((k, i) => valid.indexOf(k) === i);
    // Append any configurable slides not in the saved order (not hidden)
    for (const k of CONFIGURABLE_SLIDES) {
      if (!deduped.includes(k) && !hidden.has(k)) deduped.push(k);
    }
    configurable = deduped.filter((k) => !hidden.has(k));
  } else {
    configurable = CONFIGURABLE_SLIDES.filter((k) => !hidden.has(k));
  }

  return [...LOCKED_SLIDES, ...configurable];
};

export { B };