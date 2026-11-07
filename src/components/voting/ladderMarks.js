// The named marks on the Analyst ladder, as the ballot reads them.
//
// The authoritative table is base44/shared/votingProgress.ts, which is what the voting
// functions count a Fellow's sets against. The ballot keeps its own reading of the same
// thresholds so a mark can be named on the glass the moment it is reached, rather than
// waiting on a context payload that may still be carrying an older table. The numbers and
// the names below are the shared table's, in its order: change them in one place only.
//
// Nothing here is measurement. A mark is a recognition of service, never a weight.
// The graduation, and the office it confers.
//
// A Fellow is seated as an Associate Analyst by the invitation; the office of Analyst is
// graduated into at thirty measured sets, and the Flight Plan — the desk an Analyst reads
// the field from — opens with it. The threshold is the shared table's ANALYST_SETS: change
// it there, and here.
export const ANALYST_SETS = 30;

export const isAnalystOffice = (setsCompleted) =>
  Math.max(0, Number(setsCompleted) || 0) >= ANALYST_SETS;

export const LADDER_MARKS = [
  { sets: 1, name: 'First Light' },
  { sets: 3, name: 'Flight Card' },
  { sets: 6, name: 'Clean Sweep' },
  { sets: ANALYST_SETS, name: 'Analyst', level: 2 },
  { sets: 10, name: 'Steady Hand' },
  { sets: 16, name: 'Field Note' },
  { sets: 24, name: 'Silver Eye' },
  { sets: 34, name: 'Long Watch' },
  { sets: 46, name: 'Brass Rule' },
  { sets: 60, name: 'Deep Read' },
  { sets: 78, name: 'Cool Head' },
  { sets: 100, name: 'Broad Sheet' },
  { sets: 125, name: 'Senior Analyst', level: 3 },
  { sets: 150, name: 'Seasoned Read' },
  { sets: 180, name: 'Wide Ledger' },
  { sets: 215, name: 'Standing Watch' },
  { sets: 250, name: 'Full Survey' },
  { sets: 300, name: 'Lead Analyst', level: 4 },
  { sets: 350, name: 'Long Record' },
  { sets: 400, name: 'Sounding' },
  { sets: 450, name: 'The Long Ledger' },
  { sets: 500, name: 'Principal Analyst', level: 5 },
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