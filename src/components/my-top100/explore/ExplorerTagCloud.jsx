import { X } from 'lucide-react';

// The vocabulary, held as pills.
//
// One word per pill at one size, in one order: the cloud never re-cuts itself as the
// reading narrows, so nothing shifts under a hand that is mid-press. The cohorts lead it —
// Women and Men are families of the record rather than words filed against it, so they are
// pinned at the head of the row and never move, and the directory's own vocabulary follows
// in its reading order behind them.
//
// A word nobody in the current reading holds is dimmed and refused — the pill stays in
// place so the row keeps its shape, but pressing it can no longer lead to an empty sheet,
// and a second tag still narrows rather than dead-ends.
const CLOUD_CAP = 24;

const COHORTS = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
];

export default function ExplorerTagCloud({ tags, available, selected, cohort, onCohort, onToggle, onClear }) {
  const words = tags || [];
  const hasSelection = selected.length > 0 || (cohort && cohort !== 'all');
  if (words.length === 0 && !hasSelection) return null;

  return (
    <div className="mt-1.5 flex max-h-[96px] flex-wrap content-start items-center gap-1 overflow-y-auto scrollbar-hide md:max-h-[120px]">
      {COHORTS.map((option) => {
        const active = cohort === option.key;
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            onClick={() => onCohort(active ? 'all' : option.key)}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-[3px] font-body text-[9.5px] font-bold uppercase tracking-[0.08em] leading-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
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

      {words.slice(0, CLOUD_CAP).map((tag) => {
        const active = selected.some((picked) => picked.key === tag.key);
        const live = active || available.has(tag.key);
        return (
          <button
            key={tag.key}
            type="button"
            aria-pressed={active}
            disabled={!live}
            onClick={() => onToggle(tag)}
            title={active ? `Remove ${tag.label}` : live ? `Narrow to ${tag.label}` : `Nobody in this reading is tagged ${tag.label}`}
            className={`flex items-center gap-1 rounded-full border px-2 py-[3px] font-body text-[9.5px] font-semibold leading-none transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
              active
                ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
                : live
                  ? 'border-editorial-navy/25 text-editorial-navy/75 hover:border-editorial-navy/60 hover:bg-editorial-navy/5'
                  : 'cursor-default border-editorial-navy/10 text-editorial-navy/25'
            }`}
          >
            {tag.label}
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