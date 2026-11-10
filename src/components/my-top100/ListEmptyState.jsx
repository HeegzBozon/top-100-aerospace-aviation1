import { ArrowRight } from 'lucide-react';

// The composition the Manifest opens with.
//
// One plate, and it is the act: the first place is drawn as the page's primary key,
// carrying its own number and its label, so an empty Manifest reads as begun-and-waiting
// and the only thing left to do is the only thing here to do — name someone. No record is
// offered in advance: the list begins with a name the Fellow chooses, never one handed over.
export default function ListEmptyState({ onBrowse }) {
  return (
    <div className="py-10">
      <button
        type="button"
        onClick={onBrowse}
        className="group flex w-full items-center justify-between gap-4 rounded-sm bg-editorial-copper px-6 py-5 text-left shadow-lg transition-all duration-200 hover:bg-editorial-navy hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2 focus-visible:ring-offset-editorial-cream active:translate-y-px"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-11 shrink-0 items-center justify-center border border-editorial-cream/40 font-heading text-xl text-editorial-cream/80 tabular-nums">
            01
          </span>
          <span className="min-w-0">
            <span className="block font-body text-[9.5px] font-bold uppercase tracking-[0.22em] text-editorial-cream/70">
              The first place
            </span>
            <span className="mt-1.5 block font-heading text-[22px] leading-none text-editorial-cream">
              Nominate
            </span>
          </span>
        </span>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-editorial-cream/60 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-editorial-cream"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}