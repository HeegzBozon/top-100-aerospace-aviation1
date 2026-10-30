import { RotateCcw } from "lucide-react";
import { pad, useCountdown } from "@/components/events/useCountdown";
import { RESULTS_GO_LIVE } from "./PublicationCountdown";

// The cycle, read as an instrument rather than as two lines of prose: the close and the
// day the results go live stand side by side, a label over its figure, so the cover
// reports the whole calendar in one band. Two stacked lines cost the keypad a row, and
// this cover is meant to be read at a glance — nothing on it should have to be scrolled
// to. The states are the same ones the season line has always carried: reading, failed
// with a way to read it again, and a calendar with nothing on it yet — never a blank.
const LABEL = "flex items-center gap-1 text-[8px] font-bold uppercase leading-none tracking-[0.2em]";
const FIGURE = "mt-1 block truncate text-[11.5px] font-bold leading-none tabular-nums tracking-[0.06em]";

function Reading({ label, tone, target, note, doneLabel = "Live", onRetry }) {
  const { days, hours, mins, secs, done } = useCountdown(target);

  // Seconds are an instrument, not the headline: the reading stays on days, hours and
  // minutes until the close is inside two days, when the number is worth watching tick.
  const remaining = days * 86400 + hours * 3600 + mins * 60 + secs;
  const showSecs = !!target && !done && remaining < 48 * 3600;

  return (
    <div className="min-w-0">
      <span className={LABEL} style={{ color: tone }}>
        {label}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Read the season again"
            className="transition-opacity active:opacity-60"
          >
            <RotateCcw className="h-[9px] w-[9px]" />
          </button>
        )}
      </span>

      {note ? (
        <span className={`${FIGURE} text-editorial-cream/55`}>{note}</span>
      ) : (
        <span className={`${FIGURE} text-editorial-cream`}>
          {done ? doneLabel : `${days}d ${pad(hours)}h ${pad(mins)}m${showSecs ? ` ${pad(secs)}s` : ""}`}
        </span>
      )}
    </div>
  );
}

export default function StartCycleReadout({ status, onRetry, vote = null, notify = null }) {
  // The close comes off the season record itself, so the cover never disagrees with the
  // board; the results date ships on the calendar whatever the record says.
  const season = status.loading
    ? { note: "Reading…" }
    : status.failed
      ? { note: "Unavailable", retry: true }
      : status.votingEnd
        ? { target: status.votingEnd }
        : { note: "Not scheduled" };

  return (
    <div className="mt-3 grid grid-cols-2 gap-x-3">
      {/* Each reading carries the one ask that answers it: the ballot under the close,
          the publishing alert under the day the results go live. */}
      <div className="min-w-0">
        <Reading
          label="Voting closes"
          tone="rgb(var(--editorial-copper-rgb) / 1)"
          target={season.target}
          note={season.note}
          doneLabel="Closed"
          onRetry={season.retry ? onRetry : null}
        />
        {vote ? <div className="mt-1.5 flex">{vote}</div> : null}
      </div>
      {/* The results column carries the one ask that answers it: the publishing alert
          stands under its own reading, set to the column's own left edge so both asks
          line up the same way under their countdowns. */}
      <div className="relative min-w-0 border-l border-editorial-gold/20 pl-3">
        <Reading
          label="Results go live"
          tone="rgb(var(--editorial-gold-rgb) / 1)"
          target={RESULTS_GO_LIVE}
          doneLabel="Live"
        />
        {notify ? <div className="mt-1.5 flex">{notify}</div> : null}
      </div>
    </div>
  );
}