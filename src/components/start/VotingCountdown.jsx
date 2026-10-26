import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useCountdown, pad } from "@/components/events/useCountdown";

// One reading of the cycle: the live countdown to voting close, taken from the
// season record itself, so every surface that shows it shows the same number —
// and, beside it, the ballot it is counting down to. The closing date and the
// way to vote are read in one line, and while the countdown runs the ballot is
// the first option the console's ring lands on.
export default function VotingCountdown({ target, voteTo, voteSelected }) {
  const { days, hours, mins, secs, done } = useCountdown(target);

  if (!target) return null;

  // Seconds are an instrument, not the headline: the reading stays on days, hours
  // and minutes until the close is inside two days, when the number is finally
  // worth watching tick.
  const remaining = days * 86400 + hours * 3600 + mins * 60 + secs;
  const showSecs = !done && remaining < 48 * 3600;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-[8.5px] font-bold uppercase tracking-[0.24em] text-editorial-copper md:text-[9.5px]">
        {done ? "Voting closed" : "Voting closes"}
      </span>
      {done ? null : (
        <span className="text-[10.5px] font-bold tabular-nums tracking-[0.08em] text-editorial-cream md:text-[12px]">
          {days}d {pad(hours)}h {pad(mins)}m{showSecs ? ` ${pad(secs)}s` : ""}
        </span>
      )}

      {!done && voteTo ? (
        <Link
          to={voteTo}
          aria-current={voteSelected ? "true" : undefined}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.18em] transition-[transform,box-shadow] duration-200 active:scale-95 md:text-[9.5px]"
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
    </div>
  );
}