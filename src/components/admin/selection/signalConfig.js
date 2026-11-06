// The season's vote targets, exactly as the design math sets them.
//
// One vote is one set: four cards, a top and a bottom pick, five comparisons resolved and
// ten nominee-comparisons revealed. A set therefore carries four card appearances and five
// comparisons, and the depth a nominee has been weighed to is read two ways — comparisons
// per nominee (sets × 10 ÷ pool) and appearances per nominee (sets × 4 ÷ pool).
//
// The floor (1,750 sets) and the ideal (2,650) are the only two figures the design math
// produced: 48 and 32 comparisons per nominee, converted through 2.5 comparisons per
// appearance. Realistic (2,000) and ambitious (4,000) are judgment calls around them. Both
// ends are stated for a pool of 550, so a pool of another size scales the set total and
// leaves the depth per nominee alone.

export const BASE_POOL = 550;
export const COMPARISONS_PER_SET = 5;
export const CARDS_PER_SET = 4;

export const SCENARIOS = [
  { key: 'floor', label: 'Floor', setsFor550: 1750, note: 'the hard floor' },
  { key: 'realistic', label: 'Realistic', setsFor550: 2000, note: 'a judgment call' },
  { key: 'ideal', label: 'Ideal', setsFor550: 2650, note: 'the design target' },
  { key: 'ambitious', label: 'Ambitious', setsFor550: 4000, note: 'a chosen stretch' },
];

// Sets for a pool of this size: the design's per-nominee depth, held constant.
export function setsTarget(setsFor550, pool) {
  const n = Number(pool) || 0;
  if (!n) return 0;
  return Math.round((setsFor550 * n) / BASE_POOL);
}

// Comparisons per nominee — the document's "comparisons per nominee" column.
export function comparisonsPerNominee(sets, pool) {
  const n = Number(pool) || 0;
  if (!n) return 0;
  return ((Number(sets) || 0) * COMPARISONS_PER_SET * 2) / n;
}

// Card appearances per nominee — the document's "appearances per nominee" column.
export function appearancesPerNominee(sets, pool) {
  const n = Number(pool) || 0;
  if (!n) return 0;
  return ((Number(sets) || 0) * CARDS_PER_SET) / n;
}

// The tallest scenario the run of sets has already cleared, if any.
export function bandForSets(sets, pool) {
  const cast = Number(sets) || 0;
  const cleared = [...SCENARIOS]
    .reverse()
    .find((scenario) => cast >= setsTarget(scenario.setsFor550, pool));
  return cleared || null;
}

export const share = (part, whole) => {
  const w = Number(whole) || 0;
  if (!w) return 0;
  return Math.max(0, Math.min(100, (Math.max(0, Number(part) || 0) / w) * 100));
};