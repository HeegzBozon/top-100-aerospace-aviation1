import { useCountdown, pad } from "@/components/events/useCountdown";

// One reading of the cycle: the live countdown to voting close, taken from the
// season record itself, so every surface that shows it shows the same number.
export default function VotingCountdown({ target }) {
  const { days, hours, mins, secs, done } = useCountdown(target);

  if (!target) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-[8.5px] font-bold uppercase tracking-[0.24em] text-editorial-copper md:text-[9.5px]">
        {done ? "Voting closed" : "Voting closes"}
      </span>
      {done ? null : (
        <span className="text-[10.5px] font-bold tabular-nums tracking-[0.08em] text-editorial-cream md:text-[12px]">
          {days}d {pad(hours)}h {pad(mins)}m {pad(secs)}s
        </span>
      )}
    </div>
  );
}