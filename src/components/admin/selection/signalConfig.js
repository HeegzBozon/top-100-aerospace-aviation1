// The pool's measurement targets, kept in one place so the panel, its copy and any
// export read the same arithmetic.
//
// The reliability figure is a finite-population proportion sample size: n0 = z²p(1−p)/e²,
// then corrected for a population of N. The share p is held at 0.5 — the most conservative
// value there is, so the target never flatters us — and N is the pool itself: the people
// being measured, never the possible pairs between them. It answers one question only,
// how many marks it takes for the field's reading to hold still at the stated confidence.
// It does not promise that the pool was chosen well, so the panel never presents it as a
// guarantee.

export const CONFIDENCE = [
  { key: '90', label: '90%', z: 1.645 },
  { key: '95', label: '95%', z: 1.96 },
  { key: '99', label: '99%', z: 2.576 },
];

export const MARGINS = [
  { key: '5', label: '±5%', e: 0.05 },
  { key: '3', label: '±3%', e: 0.03 },
];

export function marksRequired(pool, z, e) {
  const n = Number(pool) || 0;
  if (n < 2) return 0;
  const n0 = (z * z * 0.25) / (e * e);
  return Math.ceil(n0 / (1 + (n0 - 1) / n));
}

// The bands a signal is read against. Both axes have to hold — a pool nobody has reached,
// and a field with too few marks behind it, are each unfinished on their own — so the band
// is taken from whichever of the two is furthest behind.
export const BANDS = [
  { key: 'held', label: 'Held', at: 0 },
  { key: 'gathering', label: 'Gathering', at: 25 },
  { key: 'workable', label: 'Workable', at: 50 },
  { key: 'reliable', label: 'Reliable', at: 75 },
  { key: 'settled', label: 'Settled', at: 100 },
];

export function bandFor(strength) {
  const value = Number(strength) || 0;
  return [...BANDS].reverse().find((band) => value >= band.at) || BANDS[0];
}

export const share = (part, whole) => {
  const w = Number(whole) || 0;
  if (!w) return 0;
  return Math.max(0, Math.min(100, (Math.max(0, Number(part) || 0) / w) * 100));
};