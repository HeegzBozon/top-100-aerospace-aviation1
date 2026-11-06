// The two ballots, and what each one is called.
//
// The house publishes one naming system for its selection surfaces, and every surface
// reads it from here so a Fellow meets the same two names in the same two jobs wherever
// they stand. The internal method names — ranked choice, pairwise, anchor, rank/4 — are
// the instrument's vocabulary, not the voter's: they belong in the governance record and
// nowhere a voter has to read them.
export const MANIFEST = 'The Manifest';
export const CROSSCHECK = 'The Crosscheck';

// The distinction the two surfaces turn on, stated the same way everywhere.
export const BALLOT_DISTINCTION =
  "Both are an Analyst's duties. In the Manifest you choose who to back; in the Crosscheck the house chooses who you compare.";

// What the Crosscheck measures. This line is fixed and is never reworded per surface.
export const CROSSCHECK_LINE =
  'Measure each record by its contribution to aerospace and aviation.';

// What the Crosscheck is, said plainly: the smallest form of a ranked-choice ballot.
export const CROSSCHECK_IS =
  'A mini ranked-choice ballot — four records, one order, every review a complete ballot.';

// The office the ballot confers, and the word for the work.
//
// A Fellow who takes up the Crosscheck is not a campaigner and not a fan: they serve the
// season as an Analyst, and what they are doing is analysis. Every selection surface reads
// the office and the work from here, so the title is never spelled one way on the
// invitation and another on the ballot.
export const ANALYST = 'Analyst';
export const ANALYST_TITLE = 'TOP 100 Aerospace & Aviation Analyst';
export const ANALYSIS = 'Analysis';

// What the office asks, in one line, wherever the invitation is made.
export const ANALYSIS_IS =
  'Voting here is analysis. An Analyst measures four records against each other, one small ranked-choice ballot at a time, and every order they leave is kept.';

// The office in full.
//
// The ballot is one duty of an Analyst, not the whole of the post. The office is also what
// this platform's whole audience holds in common: a Fellow, a reader and a subscriber are
// all Analysts, and the work is the same three things wherever it is taken up — find,
// measure, and put the record in the way of the people it should reach.
export const ANALYST_OFFICE_IS =
  'An Analyst is not a voter, and not a judge. An Analyst finds the people doing the work, measures them against each other, and makes sure the record reaches the people it should reach.';

export const ANALYST_DUTIES = [
  {
    key: 'find',
    label: 'Find',
    line: 'Put a name forward, and meet the field doing the work — the directory, the volumes, the profiles, and the people nobody has introduced you to yet.',
  },
  {
    key: 'measure',
    label: 'Measure',
    line: 'Take up the Crosscheck. Four records at a time, put in order — the comparison is the finding, and every review is kept.',
  },
  {
    key: 'carry',
    label: 'Carry the record',
    line: 'Analysis turns a name into a record the house can stand behind, and a record into an introduction.',
  },
];

// Where the office sits in the institution: the first test any name passes, and the floor
// the rest of the platform is built on. Verification begins here rather than with a form.
export const ANALYST_FOUNDATION =
  'This is the front of the house. A name that Analysts have found, measured and carried is a name the platform can go on to verify and validate. Every name in a volume passed an Analyst first.';

// The one line that makes the office universal rather than a committee one has to be
// admitted to. It is never paraphrased per surface.
export const ANALYST_STANDING =
  'The office belongs to every Fellow, reader and subscriber. If you are here, you already hold it.';

// A review the voter sets aside. A set is measured across all four, so nothing is scored
// from one that is skipped, and a held one comes back exactly as it was dealt.
export const CROSSCHECK_SKIP_LABEL = 'Skip';
export const CROSSCHECK_HOLD_LABEL = 'Save for later';

// Where a record stands in the set, printed on the card.
export const PLACE_LABELS = ['First', 'Second', 'Third', 'Fourth'];