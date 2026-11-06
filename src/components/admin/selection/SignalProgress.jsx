import {
  SCENARIOS,
  COMPARISONS_PER_SET,
  setsTarget,
  comparisonsPerNominee,
  appearancesPerNominee,
  bandForSets,
  share,
} from './signalConfig';

// The monitor's progress instrument, read in the units the season's design math uses.
//
// The unit of turnout is the set: one vote, four cards, five comparisons. Progress is
// therefore measured as sets cast against the design's floor and ideal, and as the depth
// those sets have bought each nominee — comparisons per nominee, appearances per nominee.
// A share of the pool that has merely been touched is not progress on its own, so it is
// printed beside the depth rather than in place of it.
//
// Each reading counts only its own ledger: the community's sets, or the operator's test
// walk-through. Neither can move the other.

const num = (value) => Math.round(Number(value) || 0).toLocaleString();
const dec = (value) =>
  (Number(value) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

export default function SignalProgress({ totals, scopeLabel, standings = [], mode = 'live' }) {
  const live = mode === 'live';

  const pool = Number(totals?.pool) || 0;
  // Each reading counts its own marks: the community's, or the walk-through's. Never mixed.
  const marks = Number(live ? totals?.comparisons_live : totals?.comparisons_test) || 0;
  const heldApart = Number(live ? totals?.comparisons_test : totals?.comparisons_live) || 0;

  // One vote is one set of five comparisons, so turnout is read straight off the marks.
  const sets = marks / COMPARISONS_PER_SET;

  // Who this reading's marks have reached. The ledger resolves the community's figure in one
  // pass; until that reading is on the wire, the count comes from the board's own appearance
  // tally, which is that same reading's standing.
  const tallied = standings.filter((row) => (row.appearances || 0) > 0).length;
  const stated = Number(totals?.evaluated);
  const reached = live && Number.isFinite(stated) ? stated : tallied;

  const ladder = SCENARIOS.map((scenario) => ({
    ...scenario,
    sets: setsTarget(scenario.setsFor550, pool),
  }));
  const floor = ladder[0];
  const ideal = ladder[2];
  const band = bandForSets(sets, pool);

  const depth = comparisonsPerNominee(sets, pool);
  const appearances = appearancesPerNominee(sets, pool);
  const toFloor = Math.max(0, floor.sets - sets);
  const measure = share(sets, ideal.sets);

  if (!pool) {
    return (
      <div className="rounded-xl border border-editorial-navy/10 bg-card px-4 py-5 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-editorial-label">
          Signal progress
        </p>
        <p className="mt-1.5 font-heading text-base text-editorial-navy">No pool is standing here yet</p>
        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-editorial-navy/55">
          The targets are read against the nominees eligible in this scope. Once a pool is
          settled, this instrument will report the sets cast against it.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-editorial-navy/10 bg-card px-3 py-2.5">
      {/* Head: what is being counted, and which scenario the run of sets has reached. */}
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-editorial-label">
          Signal progress
        </p>
        <span className="flex items-center gap-1.5">
          <span className="text-[9px] uppercase tracking-[0.14em] text-editorial-navy/40">
            {scopeLabel || 'Scope'}
          </span>
          <span className="rounded-full border border-editorial-copper/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-editorial-copper">
            {band ? band.label : 'Below floor'}
          </span>
        </span>
      </div>

      {/* The headline: sets cast, against the floor and the ideal. */}
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="flex items-baseline gap-1 font-heading leading-none text-editorial-navy">
          <span className="text-[30px] tabular-nums">{num(sets)}</span>
          <span className="text-[13px] tabular-nums text-editorial-navy/35">
            / {num(floor.sets)} floor
          </span>
        </p>
        <p className="pb-0.5 text-right text-[10px] leading-tight text-editorial-navy/55">
          {toFloor > 0 ? (
            <>
              <span className="font-semibold tabular-nums text-editorial-navy">{num(toFloor)}</span> sets
              to the floor
            </>
          ) : (
            <span className="font-semibold text-editorial-navy">Floor cleared</span>
          )}
          <br />
          {num(ideal.sets)} at the ideal
        </p>
      </div>

      {/* The measure of the run, with the floor marked on it. */}
      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-editorial-navy/10">
        <div
          className="h-full rounded-full bg-editorial-copper transition-[width] duration-500"
          style={{ width: `${measure}%` }}
        />
        <span
          className="absolute inset-y-0 w-px bg-editorial-navy/45"
          style={{ left: `${share(floor.sets, ideal.sets)}%` }}
          aria-hidden="true"
        />
      </div>

      {/* The second axis: the depth those sets have bought each nominee. */}
      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-editorial-navy/10 pt-2">
        <div>
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-editorial-navy/45">
            {live ? 'Comparisons per nominee' : 'Test comparisons per nominee'}
          </p>
          <p className="mt-0.5 flex items-baseline gap-1 text-editorial-navy">
            <span className="font-heading text-[15px] tabular-nums">{dec(depth)}</span>
            <span className="text-[9.5px] tabular-nums text-editorial-navy/40">
              of {dec(comparisonsPerNominee(floor.sets, pool))} ·{' '}
              {dec(comparisonsPerNominee(ideal.sets, pool))}
            </span>
          </p>
        </div>
        <div>
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-editorial-navy/45">
            Appearances per nominee
          </p>
          <p className="mt-0.5 flex items-baseline gap-1 text-editorial-navy">
            <span className="font-heading text-[15px] tabular-nums">{dec(appearances)}</span>
            <span className="text-[9.5px] tabular-nums text-editorial-navy/40">
              of {dec(appearancesPerNominee(floor.sets, pool))} ·{' '}
              {dec(appearancesPerNominee(ideal.sets, pool))}
            </span>
          </p>
        </div>
      </div>

      {/* The scenarios, in order, with the set total each one asks of this pool. */}
      <div className="mt-2 flex items-end gap-1">
        {ladder.map((step) => {
          const cleared = sets >= step.sets;
          return (
            <div key={step.key} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors duration-300 ${
                  cleared ? 'bg-editorial-copper' : 'bg-editorial-navy/10'
                }`}
              />
              <p
                className={`mt-1 text-[8px] uppercase tracking-[0.1em] ${
                  band?.key === step.key
                    ? 'font-semibold text-editorial-copper'
                    : cleared
                      ? 'text-editorial-navy/45'
                      : 'text-editorial-navy/25'
                }`}
              >
                {step.label} <span className="tabular-nums">{num(step.sets)}</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Reach, printed beside the depth: the totals only hold if the allocator spreads sets. */}
      <p className="mt-1.5 text-[9px] leading-relaxed text-editorial-navy/40">
        {num(reached)} of {num(pool)} nominees {live ? 'weighed' : 'walked'} at least once. Five
        comparisons to the set, four card appearances, five set targets scaled from a pool of 550.
        The totals hold only if the sets are spread evenly; precision is read at the cut line, not
        from volume alone.
        {live
          ? heldApart > 0
            ? ` ${num(heldApart)} test comparisons are held apart from this figure.`
            : ''
          : ` Read from test sets alone; the community's figures are untouched. ${num(
              heldApart
            )} community comparisons stand outside this view.`}
      </p>
    </div>
  );
}