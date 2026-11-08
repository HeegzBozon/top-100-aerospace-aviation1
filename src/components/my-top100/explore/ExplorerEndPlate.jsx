import { UserPlus } from 'lucide-react';

// The foot of the reading.
//
// A directory that runs out should say so with its shape, not with a sentence: one copper
// hairline closed by a struck diamond — the end of the roll, the way a printed index closes
// its last column. What stands under the mark is the one thing the end of a reading is good
// for: the field is open to a name that is not in it.
//
// The name put forward here carries the narrowing with it, so a person found by pressing
// "Propulsion" arrives at the desk already filed under that word.
export default function ExplorerEndPlate({ onAdd, hint }) {
  return (
    <div className="px-6 pb-7 pt-6">
      <div className="flex items-center justify-center gap-2" aria-hidden="true">
        <span className="h-px w-12 bg-editorial-copper/35" />
        <span className="h-[5px] w-[5px] rotate-45 bg-editorial-copper" />
        <span className="h-px w-12 bg-editorial-copper/35" />
      </div>

      <div className="mt-4 text-center">
        <p className="font-heading text-[13.5px] leading-snug text-editorial-navy/70">
          Know someone who should be here?
        </p>
        {hint && (
          <p className="mx-auto mt-1 max-w-[260px] font-body text-[10px] leading-relaxed text-editorial-navy/45">
            {hint}
          </p>
        )}
        <button
          type="button"
          onClick={onAdd}
          className="mt-2.5 inline-flex items-center gap-1.5 border border-editorial-copper px-3.5 py-1.5 font-body text-[9px] font-bold uppercase tracking-[0.16em] text-editorial-label transition-colors hover:bg-editorial-copper hover:text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-navy"
        >
          <UserPlus className="h-3 w-3" aria-hidden="true" />
          Put a name forward
        </button>
      </div>
    </div>
  );
}