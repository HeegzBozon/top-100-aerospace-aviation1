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
// The unit of turnout is the mini ballot: one sitting of a ballot — four cards, five marks.
// Progress is therefore measured as mini ballots cast against the design's floor and ideal,
// and as the depth those sittings have bought each nominee — comparisons and appearances
// per nominee. A share of the pool that has merely been touched is not progress on its own,
// so it is printed beside the depth rather than in place of it.
//
// Each reading counts only its own ledger: the community's sittings, or the operator's test
// walk-through. Neither can move the other.
//
// The surface is read at a glance on a phone, so the figure, its measure and the two depth
// readings are all above the fold; the assumptions that qualify them are printed once, in a
// short line, and the long form of the caveat waits for a desk.

const num = (value) => Math.round(Number(value) || 0).toLocaleString();
const dec = (value) =>
  (Number(value) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

// Progress read as a share of the goal it is measured against. Whole numbers: this is a
// reading of how far along the run is, not a figure to be argued over to a decimal.
const pct = (part, whole) => {
  const w = Number(whole) || 0;
  if (!w) return 0;
  return Math.round((Math.max(0, Number(part) || 0) / w) * 100);
};

export default function SignalProgress({ totals, scopeLabel, standings = [], mode = 'live' }) {
  const live = mode === 'live';

  const pool = Number(totals?.pool) || 0;
  // Each reading counts its own marks: the community's, or the walk-through's. Never mixed.
  const marks = Number(live ? totals?.comparisons_live : totals?.comparisons_test) || 0;
  const heldApart = Number(live ? totals?.comparisons_test : totals?.comparisons_live) || 0;

  // One sitting is five marks, so turnout is read straight off the ledger.
  const miniBallots = marks / COMPARISONS_PER_SET;

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
  const band = bandForSets(miniBallots, pool);

  const depth = comparisonsPerNominee(miniBallots, pool);
  const appearances = appearancesPerNominee(miniBallots, pool);
  const toFloor = Math.max(0, floor.sets - miniBallots);

  // The same three readings, each stated as the share of its own goal: turnout against the
  // floor and the ideal, and the two depth readings against the depth those goals ask for.
  const floorDepth = comparisonsPerNominee(floor.sets, pool);
  const idealDepth = comparisonsPerNominee(ideal.sets, pool);
  const floorAppearances = appearancesPerNominee(floor.sets, pool);
  const idealAppearances = appearancesPerNominee(ideal.sets, pool);
  const reachedShare = pct(reached, pool);

  if (!pool) {
    return (
      <div className="rounded-xl border border-editorial-navy/10 bg-card px-4 py-5 text-center">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-editorial-label">
          Signal progress
        </p>
        <p className="mt-1.5 font-heading text-base text-editorial-navy">No pool is standing here yet</p>
        <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-editorial-navy/55">
          The targets are read against the nominees eligible in this scope. Once a pool is
          settled, this instrument will report the mini ballots cast against it.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-editorial-navy/10 bg-card px-3 py-2.5">
      {/* Head: what is being counted, and which scenario the run has reached. */}
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-editorial-label">
          Signal progress
        </p>
        <span className="flex items-center gap-1.5">
          <span className="hidden text-[9px] uppercase tracking-[0.14em] text-editorial-navy/40 md:inline">
            {scopeLabel || 'Scope'}
          </span>
          <span className="rounded-full border border-editorial-copper/50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-editorial-copper">
            {band ? band.label : 'Below floor'}
          </span>
        </span>
      </div>

      {/* The figure: mini ballots against the floor, with the ideal beside it. */}
      <div className="mt-1 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-editorial-navy/45">
            Mini ballots cast
          </p>
          <p className="mt-0.5 flex items-baseline gap-1 font-heading leading-none text-editorial-navy">
            <span className="text-[30px] tabular-nums">{num(miniBallots)}</span>
            <span className="text-[12px] tabular-nums text-editorial-navy/35">
              / {num(floor.sets)} floor
            </span>
          </p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.1em] tabular-nums text-editorial-label">
            {pct(miniBallots, floor.sets)}% of floor · {pct(miniBallots, ideal.sets)}% of ideal
          </p>
        </div>
        <p className="shrink-0 pb-0.5 text-right text-[10px] leading-tight text-editorial-navy/55">
          {toFloor > 0 ? (
            <>
              <span className="font-semibold tabular-nums text-editorial-navy">{num(toFloor)}</span> to
              the floor
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
          style={{ width: `${share(miniBallots, ideal.sets)}%` }}
        />
        <span
          className="absolute inset-y-0 w-px bg-editorial-navy/45"
          style={{ left: `${share(floor.sets, ideal.sets)}%` }}
          aria-hidden="true"
        />
      </div>

      {/* The second axis: the depth those sittings have bought each nominee. */}
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 border-t border-editorial-navy/10 pt-2">
        <div>
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-editorial-navy/45">
            {live ? 'Comparisons per nominee' : 'Test comparisons per nominee'}
          </p>
          <p className="mt-0.5 flex items-baseline gap-1 text-editorial-navy">
            <span className="font-heading text-[15px] tabular-nums">{dec(depth)}</span>
            <span className="text-[9.5px] tabular-nums text-editorial-navy/40">
              of {dec(floorDepth)} · {dec(idealDepth)}
            </span>
          </p>
          <p className="text-[8.5px] font-semibold tabular-nums tracking-[0.04em] text-editorial-label">
            {pct(depth, floorDepth)}% floor · {pct(depth, idealDepth)}% ideal
          </p>
        </div>
        <div>
          <p className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-editorial-navy/45">
            Appearances per nominee
          </p>
          <p className="mt-0.5 flex items-baseline gap-1 text-editorial-navy">
            <span className="font-heading text-[15px] tabular-nums">{dec(appearances)}</span>
            <span className="text-[9.5px] tabular-nums text-editorial-navy/40">
              of {dec(floorAppearances)} · {dec(idealAppearances)}
            </span>
          </p>
          <p className="text-[8.5px] font-semibold tabular-nums tracking-[0.04em] text-editorial-label">
            {pct(appearances, floorAppearances)}% floor · {pct(appearances, idealAppearances)}%
            ideal
          </p>
        </div>
      </div>

      {/* The scenarios, in order, with the sitting total each one asks of this pool. */}
      <div className="mt-2 flex items-end gap-1">
        {ladder.map((step) => {
          const cleared = miniBallots >= step.sets;
          return (
            <div key={step.key} className="min-w-0 flex-1">
              <div
                className={`h-1 rounded-full transition-colors duration-300 ${
                  cleared ? 'bg-editorial-copper' : 'bg-editorial-navy/10'
                }`}
              />
              <p
                className={`mt-1 truncate text-[8px] uppercase tracking-[0.1em] ${
                  band?.key === step.key
                    ? 'font-semibold text-editorial-copper'
                    : cleared
                      ? 'text-editorial-navy/45'
                      : 'text-editorial-navy/25'
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-[8px] tabular-nums leading-tight ${
                  cleared ? 'text-editorial-navy/40' : 'text-editorial-navy/25'
                }`}
              >
                {num(step.sets)}
              </p>
              {/* How far along this rung the run already stands. */}
              <p
                className={`text-[8px] font-semibold tabular-nums leading-tight ${
                  cleared ? 'text-editorial-label' : 'text-editorial-navy/30'
                }`}
              >
                {pct(miniBallots, step.sets)}%
              </p>
            </div>
          );
        })}
      </div>

      {/* Reach, printed beside the depth: the totals only hold if the allocator spreads
          sittings. Short form on a phone, full caveat on a desk. */}
      <p className="mt-1.5 text-[9px] leading-relaxed text-editorial-navy/40 md:hidden">
        {num(reached)} of {num(pool)} nominees {live ? 'weighed' : 'walked'} once (
        {reachedShare}%).{' '}
        {live
          ? `Live sets only${heldApart > 0 ? `; ${num(heldApart)} test marks held apart` : ''}.`
          : `Test sets only; ${num(heldApart)} community marks outside this view.`}
      </p>
      <p className="mt-1.5 hidden text-[9px] leading-relaxed text-editorial-navy/40 md:block">
        {num(reached)} of {num(pool)} nominees {live ? 'weighed' : 'walked'} at least once —{' '}
        {reachedShare}% of the pool. Five
        marks to the mini ballot, four card appearances, five set targets scaled from a pool of 550.
        The totals hold only if the sittings are spread evenly; precision is read at the cut line,
        not from volume alone.
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