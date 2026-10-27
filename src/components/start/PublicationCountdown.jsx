import { useCountdown, pad } from "@/components/events/useCountdown";

// The other date the cycle is read against: the day the results go live. Unlike the
// voting close it is not a season field — the issue ships on the calendar whatever
// the season record says — so it is held here and read on its own line, under the
// close it follows.
export const RESULTS_GO_LIVE = "2026-12-31T23:59:00-08:00"; // 31 Dec, 11:59pm PT

export default function PublicationCountdown() {
  const { days, hours, mins, done } = useCountdown(RESULTS_GO_LIVE);

  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <span className="text-[8.5px] font-bold uppercase tracking-[0.24em] text-editorial-gold md:text-[9.5px]">
        {done ? "Results live" : "Results go live"}
      </span>
      {done ? null : (
        <span className="text-[10.5px] font-bold tabular-nums tracking-[0.08em] text-editorial-cream md:text-[12px]">
          {days}d {pad(hours)}h {pad(mins)}m
        </span>
      )}
    </div>
  );
}