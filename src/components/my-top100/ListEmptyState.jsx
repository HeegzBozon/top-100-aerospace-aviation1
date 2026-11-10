import { Plus, ArrowRight } from 'lucide-react';

// The composition the Manifest opens with.
//
// Vacancy is the call to action: the first place is drawn as an outlined plate carrying
// its number, so the list reads as begun-and-waiting rather than as a page with nothing on
// it. One act stands beneath it — naming the first person — set as the page's primary key,
// because it is the only thing a Fellow with an empty Manifest has to do here. No record is
// offered in advance: the list begins with a name the Fellow chooses, never one handed over.
export default function ListEmptyState({ onBrowse }) {
  return (
    <div className="py-10">
      <div className="flex items-start gap-4">
        <span className="flex h-16 w-14 shrink-0 items-center justify-center border border-dashed border-editorial-copper/60 font-heading text-2xl text-editorial-copper/70 tabular-nums">
          01
        </span>
        <div className="min-w-0">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-label">
            The first place
          </p>
          <h3 className="mt-1.5 font-heading text-[22px] leading-tight text-editorial-navy">
            Begin your Manifest
          </h3>
          <p className="mt-1.5 max-w-sm font-body text-[12px] leading-relaxed text-editorial-navy/55">
            Name the people doing the work and the order is yours to set. A Manifest is a
            publication, not a vote — the field is measured on the Crosscheck.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onBrowse}
        className="group mt-8 flex w-full items-center justify-between gap-4 rounded-sm bg-editorial-copper px-6 py-5 text-left shadow-lg transition-all duration-200 hover:bg-editorial-navy hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper focus-visible:ring-offset-2 focus-visible:ring-offset-editorial-cream active:translate-y-px"
      >
        <span className="flex items-center gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-editorial-cream/40">
            <Plus className="h-4 w-4 text-editorial-cream" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block font-heading text-[21px] leading-none text-editorial-cream">
              Nominate
            </span>
            <span className="mt-2 block font-body text-[9.5px] font-bold uppercase tracking-[0.2em] text-editorial-cream/70">
              Name your first place
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