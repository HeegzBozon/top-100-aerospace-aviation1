import { X } from 'lucide-react';

// The vocabulary, held as a density cloud.
//
// Every pill carries the weight of the word in the reading the search and the cohort have
// left: a word most of the field holds stands large and leads the row, a word only a few
// hold stands small and falls to the tail. So the cloud reads as a picture of the field
// before anything is pressed — the heaviest words are the ones worth pressing — and it
// re-reads itself as the search tightens, which is what makes browsing feel like the
// vocabulary is answering rather than sitting still.
//
// Three registers, set by a word's share of the heaviest word in the row, never by an
// absolute count (the field's own numbers are small): a leader big and bold, a middling
// word at body size, a thin word small. The count is printed beside the leading and
// middling words so the size is never a guess.
//
// A word that the narrower reading (the words already pressed) can no longer reach stays in
// place, dimmed and refused: the row keeps its shape, and no press can empty the sheet.
const CLOUD_CAP = 30;

const COHORTS = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
];

const REGISTER = {
  lead: 'px-3 py-[5px] text-[11.5px] font-bold',
  mid: 'px-2.5 py-[4px] text-[10px] font-semibold',
  tail: 'px-2 py-[3px] text-[9.5px] font-semibold',
};

export default function ExplorerTagCloud({ tags, available, selected, cohort, onCohort, onToggle, onClear }) {
  const words = (tags || []).slice(0, CLOUD_CAP);
  const hasSelection = selected.length > 0 || (cohort && cohort !== 'all');
  const heaviest = words.reduce((max, tag) => Math.max(max, tag.weight || 0), 0) || 1;

  const registerOf = (weight) => {
    const share = (weight || 0) / heaviest;
    if (share >= 0.55) return 'lead';
    if (share >= 0.22) return 'mid';
    return 'tail';
  };

  return (
    <div className="mt-2 flex max-h-[112px] flex-wrap content-start items-center gap-1 overflow-y-auto scrollbar-hide md:max-h-[136px]">
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

      <span className="mx-0.5 h-4 w-px bg-editorial-navy/15" aria-hidden="true" />

      {words.map((tag) => {
        const active = selected.some((picked) => picked.key === tag.key);
        const live = active || available.has(tag.key);
        const register = registerOf(tag.weight);
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
                  : `Nobody in this reading is tagged ${tag.label}`
            }
            className={`flex items-baseline gap-1 rounded-full border font-body leading-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${REGISTER[register]} ${
              active
                ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
                : live
                  ? 'border-editorial-navy/25 text-editorial-navy/80 hover:border-editorial-navy/60 hover:bg-editorial-navy/5'
                  : 'cursor-default border-editorial-navy/10 text-editorial-navy/25'
            }`}
          >
            {tag.label}
            {register !== 'tail' && (
              <span className={`tabular-nums ${active ? 'text-editorial-cream/70' : 'text-editorial-navy/45'}`}>
                {tag.weight}
              </span>
            )}
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
          Clear
        </button>
      )}
    </div>
  );
}