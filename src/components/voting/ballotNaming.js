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
  'A mini ranked-choice ballot — four records, one order, every set a complete ballot.';

// How a set is taken: three taps, and the fourth record places itself. The verb is "put in
// order", never "rank": the instrument orders, the house measures, and nobody ranks a
// colleague.
export const CROSSCHECK_HOW =
  'Put the four records in order: tap the one that leads, then the next — the fourth places itself.';

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
  'Voting here is analysis. An Analyst measures four records against each other, one small ranked-choice ballot at a time, and the order they leave is the finding.';

// The question standing before each tap, by how many records are already placed.
export const CROSSCHECK_PROMPTS = ['Which record leads?', 'Which is next?', 'And next?'];

// A record the voter declines to judge. A set is measured across all four, so the press
// closes the set rather than reshaping it.
export const CROSSCHECK_EXCLUDE_LABEL = 'Cannot judge';

// Where a record stands in the set, printed on the card.
export const PLACE_LABELS = ['First', 'Second', 'Third', 'Fourth'];