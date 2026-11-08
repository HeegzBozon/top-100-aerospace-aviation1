import { X } from 'lucide-react';

// The vocabulary, held as a density cloud and read by facet.
//
// Every word on the sheet is true of the reading in front of it: the band is filled with the
// words the reading actually holds, and a word it does not hold is not drawn at all. A cloud
// that kept its old words and greyed them out was saying something false — that the reading
// had no other words — when the truth was the opposite: narrowing Spain leaves every other
// word the people filed under Spain carry. So the slots are refilled as the reader narrows,
// and the sheet always answers with what is left.
//
// What holds still is the measure, not the words. A word's size comes from its standing in
// the whole field, never from its share of the reading, so the same word keeps the same
// register at every narrowing and the band keeps its height and its frame.
//
// The words are not one undifferentiated row any more: they stand in columns by what they
// say about a person — the field they work in, the role they hold, the impact they carry, the
// place they are based — four across on the desk and two on the glass, so a long vocabulary
// is scanned by kind rather than read through. A facet with nobody in it does not draw.
//
// Three registers, set by a word's share of the heaviest word in its own facet, never by an
// absolute count (the field's own numbers are small): a leader big and bold, a middling word
// at body size, a thin word small. The count is printed beside the leading and middling
// words so the size is never a guess.
//
// A word that the narrower reading (the words already pressed) can no longer reach stays in
// place, dimmed and refused: the row keeps its shape, and no press can empty the sheet.
const PER_FACET = 8;

// The kinds a word is filed under, in the order they are read. Tags arrive from the directory
// with one of the NomineeTag categories; a word with none is read as part of the field.
const FACETS = [
  { key: 'field', label: 'Field', categories: ['industry', 'technology'] },
  { key: 'role', label: 'Role', categories: ['skill'] },
  { key: 'impact', label: 'Impact', categories: ['achievement', 'attribute'] },
  { key: 'region', label: 'Region', categories: ['geography'] },
];

const COHORTS = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
];

// The registers are cut twice: a column of the glass is only half a desk column wide, so on a
// phone every pill comes down a step and takes a tighter padding, and the label is allowed to
// wrap inside its capsule rather than run past the column it was filed in.
const REGISTER = {
  lead: 'px-2 py-[3.5px] text-[10.5px] font-bold md:px-3 md:py-[5px] md:text-[11.5px]',
  mid: 'px-1.5 py-[3px] text-[9.5px] font-semibold md:px-2.5 md:py-[4px] md:text-[10px]',
  tail: 'px-1.5 py-[2.5px] text-[9px] font-semibold md:px-2 md:py-[3px] md:text-[9.5px]',
};

export default function ExplorerTagCloud({ tags, available, selected, cohort, onCohort, onToggle, onClear }) {
  const hasSelection = selected.length > 0 || (cohort && cohort !== 'all');

  // Filed by facet, heaviest first in each, capped so one crowded kind of word cannot push
  // the rest of the picture out of the band.
  const buckets = FACETS.map((facet) => ({ facet, words: [] }));
  (tags || []).forEach((tag) => {
    const index = FACETS.findIndex((facet) => facet.categories.includes(tag.category));
    buckets[index === -1 ? 0 : index].words.push(tag);
  });
  const drawn = buckets
    .map(({ facet, words }) => {
      const sorted = [...words].sort(
        (a, b) => (b.fieldWeight || 0) - (a.fieldWeight || 0) || a.label.localeCompare(b.label)
      );
      return {
        facet,
        words: sorted.slice(0, PER_FACET),
        heaviest: sorted.reduce((max, tag) => Math.max(max, tag.fieldWeight || 0), 0) || 1,
      };
    })
    .filter((bucket) => bucket.words.length > 0);

  // A word's size is its standing in the field, never its share of the reading: so the same
  // word keeps the same register as the reader narrows, even as the words beside it change.
  const registerOf = (fieldWeight, heaviest) => {
    const share = (fieldWeight || 0) / heaviest;
    if (share >= 0.55) return 'lead';
    if (share >= 0.22) return 'mid';
    return 'tail';
  };

  return (
    <div className="mt-2 max-h-[128px] overflow-y-auto scrollbar-hide md:max-h-[150px]">
      <div className="flex flex-wrap items-center gap-1">
        {COHORTS.map((option) => {
          const active = cohort === option.key;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => onCohort(active ? 'all' : option.key)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-[3px] font-body text-[9.5px] font-bold uppercase leading-none tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
                active
                  ? 'border-editorial-navy bg-editorial-navy text-editorial-cream'
                  : 'border-editorial-navy/30 text-editorial-navy/75 hover:border-editorial-navy/60'
              }`}
            >
              {option.label}
              {active && <X className="h-2.5 w-2.5" aria-hidden="true" />}
            </button>
          );
        })}

        {hasSelection && (
          <button
            type="button"
            onClick={onClear}
            className="ml-0.5 font-body text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-label underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
          >
            Reset
          </button>
        )}
      </div>

      <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-2 md:gap-x-2.5 md:grid-cols-4">
        {drawn.map(({ facet, words, heaviest }) => (
          <div key={facet.key} className="min-w-0">
            <span className="block border-b border-editorial-copper/35 pb-1 font-body text-[8px] font-bold uppercase leading-none tracking-[0.1em] text-editorial-label md:pb-0.5 md:text-[7.5px] md:tracking-[0.12em]">
              {facet.label}
            </span>
            <div className="mt-1 flex flex-wrap content-start items-center gap-1">
              {words.map((tag) => {
                const active = selected.some((picked) => picked.key === tag.key);
                const live = active || available.has(tag.key);
                const register = registerOf(tag.fieldWeight, heaviest);
                return (
                  <button
                    key={tag.key}
                    type="button"
                    aria-pressed={active}
                    disabled={!live}
                    onClick={() => onToggle(tag)}
                    title={
                      active
                        ? `Remove ${tag.label}`
                        : live
                          ? `${tag.weight} ${tag.weight === 1 ? 'name' : 'names'} in this reading`
                          : `Nobody in this reading is filed under ${tag.label}`
                    }
                    className={`flex max-w-full items-baseline gap-1 rounded-full border text-left font-body leading-[1.15] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${REGISTER[register]} ${
                      active
                        ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
                        : live
                          ? 'border-editorial-navy/25 text-editorial-navy/80 hover:border-editorial-navy/60 hover:bg-editorial-navy/5'
                          : 'cursor-default border-editorial-navy/10 text-editorial-navy/25'
                    }`}
                  >
                    <span className="min-w-0">{tag.label}</span>
                    {register !== 'tail' && (
                      <span className={`shrink-0 tabular-nums ${active ? 'text-editorial-cream/70' : 'text-editorial-navy/45'}`}>
                        {tag.weight}
                      </span>
                    )}
                    {active && <X className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}