// The named marks on the Analyst ladder, as the ballot reads them.
//
// The authoritative table is base44/shared/votingProgress.ts, which is what the voting
// functions count a Fellow's sets against. The ballot keeps its own reading of the same
// thresholds so a mark can be named on the glass the moment it is reached, rather than
// waiting on a context payload that may still be carrying an older table. The numbers and
// the names below are the shared table's, in its order: change them in one place only.
//
// Nothing here is measurement. A mark is a recognition of service, never a weight.
export const LADDER_MARKS = [
  { sets: 1, name: 'First Light' },
  { sets: 3, name: 'Flight Card' },
  { sets: 6, name: 'Clean Sweep' },
  { sets: 10, name: 'Steady Hand' },
  { sets: 15, name: 'Field Note' },
  { sets: 25, name: 'Silver Eye' },
  { sets: 40, name: 'Long Watch' },
  { sets: 60, name: 'Brass Rule' },
  { sets: 85, name: 'Deep Read' },
  { sets: 120, name: 'Senior Analyst', level: 2 },
  { sets: 150, name: 'Cool Head' },
  { sets: 190, name: 'Broad Sheet' },
  { sets: 240, name: 'Seasoned Read' },
  { sets: 300, name: 'Wide Ledger' },
  { sets: 400, name: 'Lead Analyst', level: 3 },
  { sets: 520, name: 'Long Record' },
  { sets: 660, name: 'Standing Watch' },
  { sets: 820, name: 'Full Survey' },
  { sets: 1000, name: 'Thousandth Set' },
  { sets: 1250, name: 'The Long Ledger' },
  { sets: 1704, name: 'Principal Analyst', level: 4 },
];

// The mark a count of sets is working towards.
export function markAhead(setsCompleted) {
  const done = Math.max(0, Number(setsCompleted) || 0);
  return LADDER_MARKS.find((mark) => mark.sets > done) || null;
}

// The last mark a count of sets has passed.
export function markReached(setsCompleted) {
  const done = Math.max(0, Number(setsCompleted) || 0);
  return [...LADDER_MARKS].reverse().find((mark) => done >= mark.sets) || null;
}

// Every mark crossed between two counts — what one recorded set turned over.
export function marksClimbedBetween(from, to) {
  const before = Math.max(0, Number(from) || 0);
  const after = Math.max(0, Number(to) || 0);
  return LADDER_MARKS.filter((mark) => mark.sets > before && mark.sets <= after);
}