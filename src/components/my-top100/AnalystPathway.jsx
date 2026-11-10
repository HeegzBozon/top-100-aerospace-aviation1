import { ArrowRight, Check } from 'lucide-react';
import { ANALYST_SETS, LADDER_MARKS } from '@/components/voting/ladderMarks';

// The Analyst pathway, kept at the right margin of the Manifest.
//
// A Fellow is seated as an Associate Analyst by the invitation; the offices above it are
// taken by service recorded on the Crosscheck. The ladder is therefore shown as a ladder —
// the office now held, the next one, and the work in front of it — rather than as a number
// on its own, because the number only means anything next to the rung it opens.
//
// Recognition only. Nothing here is read by discovery, ordering, measurement or scoring, and
// the thresholds are the shared ladder's: change them there, not here.
const RUNGS = [
  { name: 'Associate Analyst', sets: 0 },
  ...LADDER_MARKS.filter((mark) => mark.level).map((mark) => ({ name: mark.name, sets: mark.sets })),
];

const rungFor = (sets) => [...RUNGS].reverse().find((rung) => sets >= rung.sets) || RUNGS[0];
const rungAhead = (sets) => RUNGS.find((rung) => rung.sets > sets) || null;

const Tick = ({ done }) => (
  <span
    className={`mt-[2px] flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
      done
        ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
        : 'border-editorial-navy/25 bg-transparent'
    }`}
    aria-hidden="true"
  >
    {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
  </span>
);

export default function AnalystPathway({
  office,
  hasFirstSelection = false,
  onOpenFlight,
  className = '',
}) {
  const sets = Math.max(0, office?.sets || 0);
  const held = rungFor(sets);
  const ahead = rungAhead(sets);
  const within = ahead ? Math.max(0, Math.min(sets, ahead.sets)) : held.sets;
  const measure = ahead ? Math.min(100, (within / ahead.sets) * 100) : 100;

  const firstFiled = hasFirstSelection;
  const analystTaken = sets >= ANALYST_SETS;

  return (
    <div className={`border-t-2 border-editorial-copper pt-3.5 ${className}`}>
      <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-label">
        The Analyst pathway
      </p>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <h3 className="font-heading text-[17px] leading-tight text-editorial-navy">{held.name}</h3>
        <p className="shrink-0 font-body text-[9px] font-bold uppercase tracking-[0.12em] text-editorial-label tabular-nums">
          {sets} evaluations
        </p>
      </div>

      {office?.status === 'error' ? (
        <p className="mt-1.5 font-body text-[10.5px] leading-relaxed text-editorial-navy/50">
          Your standing could not be read just now.
        </p>
      ) : (
        <p className="mt-1.5 font-body text-[10.5px] leading-relaxed text-editorial-navy/60">
          {ahead
            ? `${ahead.sets - sets} more Crosscheck evaluations to the office of ${ahead.name}.`
            : 'The highest office on the ladder, held on service recorded.'}
        </p>
      )}

      <div
        className="mt-2.5 h-[3px] w-full overflow-hidden bg-editorial-navy/10"
        role="progressbar"
        aria-valuenow={sets}
        aria-valuemin={0}
        aria-valuemax={ahead ? ahead.sets : held.sets || 1}
        aria-label={
          ahead
            ? `${sets} of ${ahead.sets} Crosscheck evaluations to ${ahead.name}`
            : 'The top office held'
        }
      >
        <span
          className="block h-full bg-gradient-to-r from-editorial-copper to-editorial-gold transition-[width] duration-700"
          style={{ width: `${measure}%` }}
        />
      </div>

      {/* The checklist: the first act, then the sets, then the desk they open. */}
      <ul className="mt-3 space-y-2 border-t border-editorial-navy/10 pt-3">
        <li className="flex items-start gap-2">
          <Tick done={firstFiled} />
          <p className="font-body text-[10.5px] leading-relaxed text-editorial-navy/75">
            Nominate your first selection for TOP 100 Aerospace &amp; Aviation
          </p>
        </li>
        <li className="flex items-start gap-2">
          <Tick done={analystTaken} />
          <p className="font-body text-[10.5px] leading-relaxed text-editorial-navy/75">
            {analystTaken
              ? 'Take the office of Analyst — thirty Crosscheck evaluations recorded'
              : `Collect ${ANALYST_SETS - Math.min(sets, ANALYST_SETS)} more Crosscheck evaluations to take the office of Analyst`}
            <span className="mt-0.5 block font-body text-[9px] font-bold uppercase tracking-[0.14em] text-editorial-navy/35 tabular-nums">
              {Math.min(sets, ANALYST_SETS)} of {ANALYST_SETS}
            </span>
          </p>
        </li>
      </ul>

      {/* The ladder itself: every office, the rung held struck in copper. */}
      <ol className="mt-3 border-t border-editorial-navy/10 pt-2.5">
        {RUNGS.map((rung) => {
          const isHeld = rung.name === held.name;
          const passed = sets >= rung.sets && !isHeld;
          return (
            <li key={rung.name} className="flex items-center gap-2 py-[3px]">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  isHeld
                    ? 'bg-editorial-copper ring-2 ring-editorial-copper/25'
                    : passed
                      ? 'bg-editorial-copper/45'
                      : 'bg-editorial-navy/15'
                }`}
                aria-hidden="true"
              />
              <span
                className={`flex-1 truncate font-body text-[10px] uppercase tracking-[0.1em] ${
                  isHeld ? 'font-bold text-editorial-navy' : 'text-editorial-navy/50'
                }`}
              >
                {rung.name}
              </span>
              <span className="shrink-0 font-body text-[9px] text-editorial-navy/30 tabular-nums">
                {rung.sets}
              </span>
            </li>
          );
        })}
      </ol>

      {office?.isAnalyst && onOpenFlight && (
        <button
          type="button"
          onClick={onOpenFlight}
          className="desk-key desk-key-primary mt-3 w-full justify-center"
        >
          Open the Flight Plan
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}