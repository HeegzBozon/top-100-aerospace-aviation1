// ── BALLOT MEASUREMENT PARITY CHECK ─────────────────────────────────────────
//
// A repeatable guard on the one definition both monitors read
// (src/lib/ballotMeasurement.js). Run it after any change to the measurement, the targets
// or the ballot recorder:
//
//   npm run check:ballot-parity
//
// It asserts the units the recorder actually writes, that coverage can never exceed the
// pool, that an empty pool never divides by zero, and that two surfaces holding the same
// raw counts render the same reading.

import {
  measureBallot,
  share,
  CARDS_PER_SITTING,
  MARKS_PER_SITTING,
  NOMINEE_TOUCHES_PER_MARK,
  COMPARISONS_PER_APPEARANCE,
  SCENARIOS,
} from '../src/lib/ballotMeasurement.js';

let failed = 0;

function check(name, condition, detail = '') {
  if (condition) return;
  failed += 1;
  console.error(`✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

function equal(name, actual, expected) {
  check(name, Object.is(actual, expected), `expected ${expected}, got ${actual}`);
}

function near(name, actual, expected, tolerance = 1e-9) {
  check(name, Math.abs(actual - expected) <= tolerance, `expected ${expected}, got ${actual}`);
}

// 1. The units, as functions/submitAnchorVote writes them.
equal('a sitting sets four cards', CARDS_PER_SITTING, 4);
equal('a sitting writes seven marks', MARKS_PER_SITTING, 7);
equal('a mark weighs two nominees', NOMINEE_TOUCHES_PER_MARK, 2);
near('a card appearance spends 3.5 nominee-comparisons', COMPARISONS_PER_APPEARANCE, 3.5);

const one = measureBallot({ pool: 550, marks: 7, covered: 4 });
equal('seven marks are one sitting', one.sittings, 1);
equal('one sitting is four appearances', one.appearances, 4);
near('one sitting reveals fourteen nominee-comparisons', one.marks * NOMINEE_TOUCHES_PER_MARK, 14);

// 2. Coverage is clamped to the pool: a count from outside the cohort can never stand.
const overCovered = measureBallot({ pool: 550, marks: 7985, covered: 900 });
equal('covered nominees cannot exceed the pool', overCovered.covered, 550);
equal('coverage is a full 100% at the cap', Math.round(overCovered.coverage), 100);

// 3. An empty pool never divides by zero, and reports itself unready.
const empty = measureBallot({ pool: 0, marks: 120, covered: 12 });
equal('an empty pool reads no pool', empty.pool, 0);
equal('an empty pool reads no coverage', empty.covered, 0);
equal('an empty pool is not ready', empty.ready, false);
check(
  'an empty pool divides nothing',
  Number.isFinite(empty.comparisonsPerNominee) &&
    Number.isFinite(empty.appearancesPerNominee) &&
    Number.isFinite(empty.coverage),
  'a non-finite reading was produced'
);
equal('nothing is claimed against an empty pool', empty.floor.sittings, 0);

// 4. The targets move with the field; the depth they ask of each nominee does not.
const small = measureBallot({ pool: 550, marks: 0, covered: 0 });
const large = measureBallot({ pool: 1100, marks: 0, covered: 0 });
equal('a doubled pool doubles the floor', large.floor.sittings, small.floor.sittings * 2);
SCENARIOS.forEach((scenario, index) => {
  near(
    `${scenario.label} asks the same comparisons per nominee at any pool`,
    small.ladder[index].comparisons,
    large.ladder[index].comparisons
  );
});

// 5. Parity: the same raw counts make the same reading, whichever desk asks for it.
const reading = { pool: 550, marks: 7985, covered: 544 };
const fromCommittee = measureBallot(reading);
const fromSelectionDesk = measureBallot(reading);
equal('committee and desk agree on sittings', fromCommittee.sittings, fromSelectionDesk.sittings);
equal('committee and desk agree on coverage', fromCommittee.covered, fromSelectionDesk.covered);
equal(
  'committee and desk agree on depth',
  fromCommittee.comparisonsPerNominee,
  fromSelectionDesk.comparisonsPerNominee
);
equal(
  'committee and desk agree on the floor',
  fromCommittee.floor.sittings,
  fromSelectionDesk.floor.sittings
);
equal('committee and desk agree on the band', fromCommittee.band?.key, fromSelectionDesk.band?.key);

// 6. A share is a bounded percentage, and an absent goal is a zero rather than NaN.
equal('a share of nothing is zero', share(10, 0), 0);
near('a share is a percentage', share(1, 4), 25);
equal('a share cannot read above its goal', share(600, 550), 100);

if (failed) {
  console.error(`\n${failed} ballot measurement check(s) failed.`);
  process.exit(1);
}

console.log('Ballot measurement parity holds.');