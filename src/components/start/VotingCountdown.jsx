import { useCountdown, pad } from "@/components/events/useCountdown";

// One reading of the cycle: the live countdown to voting close, taken from the
// season record itself, so every surface that shows it shows the same number. The
// ballot it counts down to is offered beside the readings rather than inside this
// line, so the title screen's two actions stand together and this reading never
// moves aside to make room for a key.
export default function VotingCountdown({ target }) {
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
    </div>
  );
}