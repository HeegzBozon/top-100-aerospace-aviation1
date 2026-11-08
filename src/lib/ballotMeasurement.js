// ── CANONICAL BALLOT MEASUREMENT ────────────────────────────────────────────
//
// One definition of ballot activity, read by both monitors — the committee's live monitor
// beside the Crosscheck, and the selection desk in the admin portal. Neither surface may
// divide a total by its own figure, keep its own target table, or count a nominee the
// cohort does not hold: every reading below is computed here, once.
//
// THE UNITS, as the recorder writes them (base44/functions/submitAnchorVote):
//
//   mark         one nominee weighed against another — a single PairwiseVote row.
//   sitting      one completed set: four cards set down, seven marks written (the top over
//                each of the other three, the top over the bottom, each neutral over the
//                bottom). One sitting is one mini ballot.
//   appearance   one card set down in front of a Fellow. A sitting carries four.
//   comparison   a mark's two halves: both nominees in it are weighed against each other.
//                One mark is two nominee-comparisons, so one sitting reveals fourteen.
//
// THE DEPTH READINGS:
//   comparisons per nominee  = marks × 2 ÷ pool
//   appearances per nominee  = sittings × 4 ÷ pool
//
// THE TARGETS are stated as card appearances per nominee and converted against the pool
// that is standing, so a target moves with the field and the depth it asks of each nominee
// stays put. The previous two tables had drifted apart (one read five marks to the sitting,
// the other seven); there is now one table, and it is this one.
//
// COVERAGE is how many of the pool's own nominees the reading has reached at least once.
// It is clamped to the pool: a count from outside the cohort can never stand as coverage.

export const CARDS_PER_SITTING = 4;
export const MARKS_PER_SITTING = 7;
export const NOMINEE_TOUCHES_PER_MARK = 2;

// The nominee-comparisons one card appearance spends: fourteen touches across four cards.
export const COMPARISONS_PER_APPEARANCE =
  (MARKS_PER_SITTING * NOMINEE_TOUCHES_PER_MARK) / CARDS_PER_SITTING;

// The season's targets, stated in card appearances per nominee. Floor and ideal are the
// design's own figures; realistic and ambitious are the judgment calls around them.
export const SCENARIOS = [
  { key: 'floor', label: 'Floor', appearances: 12, note: 'the hard floor' },
  { key: 'realistic', label: 'Realistic', appearances: 16, note: 'a judgment call' },
  { key: 'ideal', label: 'Ideal', appearances: 20, note: 'the design target' },
  { key: 'ambitious', label: 'Ambitious', appearances: 32, note: 'a chosen stretch' },
];

// A share of a goal, as a number. Formatting belongs to the surface, never here.
export function share(part, whole) {
  const target = Number(whole) || 0;
  if (!target) return 0;
  return Math.max(0, Math.min(1, (Math.max(0, Number(part) || 0) / target))) * 100;
}

// Everything a monitor prints, from the three raw counts its function returns.
// `covered` is passed through the pool clamp, so a reading can never claim to have weighed
// more nominees than the cohort holds.
export function measureBallot({ pool, marks, covered } = {}) {
  const field = Math.max(0, Math.round(Number(pool) || 0));
  const total = Math.max(0, Math.round(Number(marks) || 0));
  const reached = Math.max(0, Math.min(field, Math.round(Number(covered) || 0)));

  // A sitting is whole or it is not cast: 7,985 marks are 1,140 sittings and five marks
  // written beside them, never 1,140.7 mini ballots.
  const sittings = Math.floor(total / MARKS_PER_SITTING);
  const appearances = sittings * CARDS_PER_SITTING;

  const ladder = SCENARIOS.map((scenario) => ({
    ...scenario,
    sittings: field ? Math.round((field * scenario.appearances) / CARDS_PER_SITTING) : 0,
    comparisons: scenario.appearances * COMPARISONS_PER_APPEARANCE,
  }));

  const floor = ladder[0];
  const ideal = ladder[2];
  const ambitious = ladder[3];
  const band = field ? [...ladder].reverse().find((step) => step.sittings > 0 && sittings >= step.sittings) || null : null;

  return {
    pool: field,
    marks: total,
    covered: reached,
    coverage: field ? (reached / field) * 100 : 0,
    sittings,
    appearances,
    comparisonsPerNominee: field ? (total * NOMINEE_TOUCHES_PER_MARK) / field : 0,
    appearancesPerNominee: field ? appearances / field : 0,
    ladder,
    floor,
    ideal,
    ambitious,
    band,
    toFloor: Math.max(0, floor.sittings - sittings),
    toIdeal: Math.max(0, ideal.sittings - sittings),
    // The measure's own scale: the ambitious end, so the fill reads as progress along the
    // whole run rather than along the stretch already cleared.
    scale: ambitious.sittings || 1,
    fill: ambitious.sittings ? Math.min(1, sittings / ambitious.sittings) : 0,
    ready: field > 0,
  };
}