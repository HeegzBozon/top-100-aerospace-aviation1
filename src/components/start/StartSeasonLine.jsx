import { RotateCcw } from "lucide-react";
import VotingCountdown from "./VotingCountdown";

// The cycle, read once: the countdown to voting close, straight off the season
// record, so the title screen never disagrees with the board. Loading, failure
// with a way to read it again, and an empty calendar are all states of the same
// line — the surface never shows a blank where a date should be.
export default function StartSeasonLine({ status, onRetry }) {
  return (
    <div className="flex min-h-[16px] shrink-0 items-center gap-2 text-[9px] tracking-[0.06em] text-editorial-cream/55 md:text-[11px]">
      {status.loading ? (
        <span className="text-editorial-cream/45">Reading the season…</span>
      ) : status.failed ? (
        <>
          <span className="text-editorial-cream/45">Season status unavailable.</span>
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1 uppercase tracking-[0.18em] text-editorial-gold"
          >
            <RotateCcw className="h-[10px] w-[10px]" /> Read again
          </button>
        </>
      ) : status.votingEnd ? (
        <VotingCountdown target={status.votingEnd} />
      ) : (
        <span>No season on the calendar yet. The next cycle opens here.</span>
      )}
    </div>
  );
}