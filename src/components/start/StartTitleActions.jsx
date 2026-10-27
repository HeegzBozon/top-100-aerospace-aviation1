import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import NotifyMe from "./NotifyMe";
import { VOTE_OPTION } from "./startMenuConfig";

// The two things the title screen asks for, read as one row: the ballot while the
// cycle is asking for it, and the publishing alert for a reader who will not be
// watching on the day. The readings above them are what they answer; nothing here
// wraps into those lines.
//
// The alert opens its own field directly under the row, full width, so the row
// itself never moves when it does — and on a phone with the keys up, that field is
// the first thing above them.
export default function StartTitleActions({ voteLive = false, voteSelected = false }) {
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2 md:mt-3">
      {voteLive ? (
        <Link
          to={VOTE_OPTION.to}
          aria-current={voteSelected ? "true" : undefined}
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.18em] transition-[transform,box-shadow] duration-200 active:scale-95 md:text-[9.5px]"
          style={{
            color: voteSelected ? "#16293F" : "rgb(var(--editorial-gold-rgb) / 0.92)",
            background: voteSelected
              ? "rgb(var(--editorial-gold-rgb) / 0.95)"
              : "rgb(var(--editorial-gold-rgb) / 0.14)",
            boxShadow: voteSelected
              ? "0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.7), 0 6px 16px rgba(3,6,13,0.4)"
              : "inset 0 0 0 1px rgb(var(--editorial-gold-rgb) / 0.5)",
          }}
        >
          Vote now
          <ArrowRight className="h-[9px] w-[9px]" />
        </Link>
      ) : null}

      <NotifyMe />
    </div>
  );
}