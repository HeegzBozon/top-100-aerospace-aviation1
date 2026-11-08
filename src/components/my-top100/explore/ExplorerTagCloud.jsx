import { X } from 'lucide-react';

// The vocabulary, held as pills.
//
// One word per pill at one size, in one order: the cloud never re-cuts itself as the
// reading narrows, so nothing shifts under a hand that is mid-press. The list is the
// directory's own vocabulary, weighted once and sorted once, and a family narrows which
// words are shown rather than which weights they carry.
//
// A word nobody in the current reading holds is dimmed and refused — the pill stays in
// place so the row keeps its shape, but pressing it can no longer lead to an empty sheet,
// and a second tag still narrows rather than dead-ends.
const CLOUD_CAP = 24;

export default function ExplorerTagCloud({ tags, available, selected, onToggle, onClear }) {
  const words = tags || [];
  const hasSelection = selected.length > 0;
  if (words.length === 0 && !hasSelection) return null;

  return (
    <section className="mt-1.5 border-t border-editorial-navy/15 pt-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="pd-label text-[8px]">
          {hasSelection ? `${selected.length} tag${selected.length === 1 ? '' : 's'} holding` : 'Read by tag'}
        </p>
        {hasSelection && (
          <button
            type="button"
            onClick={onClear}
            className="font-body text-[8px] font-bold uppercase tracking-[0.16em] text-editorial-label underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
          >
            Clear tags
          </button>
        )}
      </div>

      <div className="mt-1 flex max-h-[78px] flex-wrap content-start gap-1 overflow-y-auto scrollbar-hide md:max-h-[104px]">
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
      </div>
    </section>
  );
}