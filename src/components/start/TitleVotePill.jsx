import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { VOTE_OPTION } from "./startMenuConfig";

// The ballot, printed under the reading that asks for it.
//
// The close and the way to vote are one line of the cover, so the ask stands on its own
// column instead of beside the way in. It is a link, not a field: one press lands on the
// ballot itself, with the title card in front of the Selection Committee skipped.
/* min-h-[24px] is the smallest a target may be — the type stays at 8.5px, the box grows
   around it, so the pill reads exactly as it did and the thumb has something to land on. */
const PILL =
  "inline-flex min-h-[24px] shrink-0 items-center gap-1 rounded-full px-2.5 py-[5px] text-[8.5px] font-bold uppercase tracking-[0.18em] transition-[transform,box-shadow] duration-200 active:scale-95 md:text-[9.5px]";

export default function TitleVotePill({ selected = false }) {
  return (
    <Link
      to={VOTE_OPTION.to}
      data-hh-key={VOTE_OPTION.key}
      aria-current={selected ? "true" : undefined}
      className={PILL}
      style={{
        color: selected ? "#16293F" : "rgb(var(--editorial-gold-rgb) / 0.92)",
        background: selected ? "rgb(var(--editorial-gold-rgb) / 0.95)" : "rgb(var(--editorial-gold-rgb) / 0.14)",
        boxShadow: selected
          ? "0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.7), 0 6px 16px rgba(3,6,13,0.4)"
          : "inset 0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.5)",
      }}
    >
      Vote now
      <ArrowRight className="h-[9px] w-[9px]" />
    </Link>
  );
}