// The Analyst ladder, read the way a division ladder is read.
//
// Five offices, three divisions under each: a Fellow climbs the divisions of an office
// before the next office is conferred — Associate I, Associate II, Associate III, then
// Analyst I, and on to Principal III. The office floors are the shared table's
// (base44/shared/votingProgress.ts), and the divisions sit on even thirds of each office's
// stretch, so a division is never more than a third of an office away.
//
// The numeral rises with the work: III stands above II, and II above I, so the III of an
// office is that office standing — the rung the house reads as a promotion, the one the
// Flight Plan opens with, and the one drawn taller on the rail.
//
// Nothing here is measurement. A division is a recognition of service, never a weight, and
// the ladder is never read by discovery, ordering or scoring.
export const ANALYST_SETS = 30;

export const isAnalystOffice = (evaluations) =>
  Math.max(0, Number(evaluations) || 0) >= ANALYST_SETS;

// The offices, and the floor of each of their three divisions, in evaluations.
const OFFICES = [
  { level: 1, office: 'Associate Analyst', tier: 'Associate', divisions: [0, 10, 20] },
  { level: 2, office: 'Analyst', tier: 'Analyst', divisions: [ANALYST_SETS, 62, 93] },
  { level: 3, office: 'Senior Analyst', tier: 'Senior', divisions: [125, 183, 242] },
  { level: 4, office: 'Lead Analyst', tier: 'Lead', divisions: [300, 367, 433] },
  { level: 5, office: 'Principal Analyst', tier: 'Principal', divisions: [500, 600, 700] },
];

const DIVISION_NUMERALS = ['I', 'II', 'III'];

export const LADDER_MARKS = OFFICES.flatMap((entry) =>
  entry.divisions.map((sets, index) => ({
    sets,
    name: `${entry.tier} ${DIVISION_NUMERALS[index]}`,
    division: DIVISION_NUMERALS[index],
    tier: entry.tier,
    office: entry.office,
    level: index === 0 ? entry.level : null,
  })),
);

// The division a count of evaluations is working towards.
export function markAhead(evaluations) {
  const done = Math.max(0, Number(evaluations) || 0);
  return LADDER_MARKS.find((mark) => mark.sets > done) || null;
}

// The last division a count of evaluations has passed.
export function markReached(evaluations) {
  const done = Math.max(0, Number(evaluations) || 0);
  return [...LADDER_MARKS].reverse().find((mark) => done >= mark.sets) || null;
}

// Every division crossed between two counts — what one recorded evaluation turned over.
export function marksClimbedBetween(from, to) {
  const before = Math.max(0, Number(from) || 0);
  const after = Math.max(0, Number(to) || 0);
  return LADDER_MARKS.filter((mark) => mark.sets > before && mark.sets <= after);
}