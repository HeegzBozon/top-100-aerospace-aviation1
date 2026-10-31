import { fieldOf } from '@/components/magazine/editionCopy';

// How the edition orders the hundred.
//
// One measure, three ways of reading it. The first ten stand in measured order at the
// front of the book, where a standing earns room. From No. 11 the same measured stands
// are grouped by field, so a reader can follow one discipline through the edition and
// still find anyone by name in the alphabet at the back. The grouping is a reading
// path, never a second measure: the number printed on every entry is the standing the
// measurement gave her, and no page renumbers it.

export const OPENING_BAND = 10;
export const GUIDED_BAND = 30;

// The pages the edition reserves, marked in their own first line so a reader — and the
// renderer — can tell a placement from editorial without a second field on the record.
export const CENTERFOLD_LABEL = 'Centerfold';
export const HOUSE_AD_LABEL = 'House Advertisement';
export const PATRON_LABEL = 'Patron of Record';

export const SPREADS_IN_OPENING = 3;

export const READING_NOTE =
  'No. 1–10 stand in measured order, at the front of the book. From No. 11 the edition groups the same measured standings by field, so a reader can follow one discipline through the hundred. The grouping is editorial; the number printed on every entry is the measurement.';

// The band an entry falls in, by the standing it holds.
export const bandOf = (standing) => {
  if (standing <= OPENING_BAND) return 'measured';
  if (standing <= GUIDED_BAND) return 'guided';
  return 'field_guide';
};

export const bandLabel = (band) =>
  ({ measured: 'Measured order', guided: 'By field', field_guide: 'Field guide' }[band] || 'Measured order');

// The field each honoree is read under, keyed by the record she came from — resolved
// once from the nominees, so the composer never has to re-read an article's teaser to
// know where a name belongs.
export function editionFieldMap(nominees = []) {
  return Object.fromEntries(
    nominees
      .filter((nominee) => nominee?.id)
      .map((nominee) => [nominee.id, fieldOf(nominee.industry)]),
  );
}

// Entries grouped by field, the chapter holding the edition's best-placed name first,
// and each chapter running in measured order within itself.
export function groupByField(entries = [], fieldOfEntry = () => 'The Wider Field') {
  const groups = new Map();
  entries.forEach((entry) => {
    const field = fieldOfEntry(entry) || 'The Wider Field';
    if (!groups.has(field)) groups.set(field, []);
    groups.get(field).push(entry);
  });

  return [...groups.entries()]
    .map(([field, list]) => ({
      field,
      entries: list,
      from: list[0].standing,
      to: list[list.length - 1].standing,
    }))
    .sort((a, b) => a.from - b.from);
}

// The two placements the edition reserves, written as editorial rather than as a
// promise: the house's own advertisement, and the patron's slot — which states plainly
// that patronage carries no weight in the measure.
export const HOUSE_PLACEMENT = {
  kicker: HOUSE_AD_LABEL,
  heading: 'The edition continues',
  body:
    'Every cycle the community nominates, the peers evaluate, and the record is published in full: the measure, the method, and the names it holds. This page is the house’s own.',
  byline: 'TOP 100 Aerospace & Aviation · The annual edition',
};

export const PATRON_PLACEMENT = {
  kicker: PATRON_LABEL,
  heading: 'This placement is held',
  body:
    'Reserved for the patron of this edition. Patronage supports the publication — printing, the platform, and the work of measurement. It carries no weight in the measure, and it never sets the order of this book.',
  byline: 'A Patron of Record placement, held open',
};