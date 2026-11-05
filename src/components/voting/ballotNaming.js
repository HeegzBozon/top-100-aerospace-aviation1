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
  'In the Manifest you choose who to back. In the Crosscheck the house chooses who you compare.';

// What the Crosscheck measures. This line is fixed and is never reworded per surface.
export const CROSSCHECK_LINE =
  'Measure each record by its contribution to aerospace and aviation.';

// How a set is taken: three taps, and the fourth record places itself.
export const CROSSCHECK_HOW =
  'Four records arrive together. Tap the one that leads, then the next — the fourth places itself.';

// The question standing before each tap, by how many records are already placed.
export const CROSSCHECK_PROMPTS = ['Which record leads?', 'Which is next?', 'And next?'];

// A record the voter declines to judge. A set is measured across all four, so the press
// closes the set rather than reshaping it.
export const CROSSCHECK_EXCLUDE_LABEL = 'Cannot judge';

// Where a record stands in the set, printed on the card.
export const PLACE_LABELS = ['First', 'Second', 'Third', 'Fourth'];