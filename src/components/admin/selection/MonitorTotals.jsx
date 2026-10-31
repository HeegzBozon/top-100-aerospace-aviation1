import { useEffect, useMemo, useState } from 'react';
import { Radio, Users, Layers, Scale, Gauge, ClipboardList, ChevronDown } from 'lucide-react';

// The head of the monitor: what the platform is counting right now, and the windows it is
// counting inside. Cohorts are read as the sets they belong to — one edition, its cohorts
// beneath it — because the pool is measured as one field and the sets sort within it.
// Every number here is a count, never a projection.

const TILES = [
  { key: 'pool', label: 'Standing', hint: 'in the ballot', icon: Users },
  { key: 'ballots', label: 'Ballots', hint: 'ranked lists saved', icon: Layers },
  { key: 'seeded', label: 'Seeded', hint: 'from nominations', icon: ClipboardList },
  { key: 'comparisons', label: 'Marks', hint: 'weighed pairs', icon: Scale },
  { key: 'contributors', label: 'Community', hint: 'weighing', icon: Gauge },
  { key: 'votes_per_contributor', label: 'Marks each', hint: 'average', icon: Radio },
];

function fmt(value) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

function windowState(cohort) {
  if (cohort.open) return { text: 'Counting', tone: '#2E7D5B' };
  if (cohort.within_window) return { text: 'In window, not open', tone: '#8F5C2C' };
  return { text: 'Closed', tone: 'rgba(30,58,90,0.55)' };
}

function closesOn(value) {
  return value
    ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'no date set';
}

function CohortLine({ cohort }) {
  const state = windowState(cohort);

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t border-editorial-navy/10 py-1.5 pl-7 pr-3">
      <span className="font-heading text-[12px] text-editorial-navy">{cohort.label}</span>
      <span className="text-[10.5px] tabular-nums text-editorial-navy/55">
        {fmt(cohort.pool)} standing · {fmt(cohort.ballots)} ballots · {fmt(cohort.seeded)} seeded · {fmt(cohort.comparisons)} marks
      </span>
      <span className="ml-auto text-[9.5px] font-semibold uppercase tracking-[0.16em]" style={{ color: state.tone }}>
        {state.text}
      </span>
      <span className="text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/45">
        closes {closesOn(cohort.voting_end)}
      </span>
    </div>
  );
}

export default function MonitorTotals({ totals, cohortStats, mode = 'live' }) {
  const sets = useMemo(() => {
    const map = new Map();
    (cohortStats || []).forEach((cohort) => {
      const key = cohort.set_id || cohort.season_id;
      if (!map.has(key)) map.set(key, { key, name: cohort.set_name || cohort.label, cohorts: [] });
      map.get(key).cohorts.push(cohort);
    });

    const sum = (list, field) => list.reduce((n, c) => n + (c[field] || 0), 0);

    return [...map.values()].map((set) => ({
      ...set,
      pool: sum(set.cohorts, 'pool'),
      ballots: sum(set.cohorts, 'ballots'),
      seeded: sum(set.cohorts, 'seeded'),
      comparisons: sum(set.cohorts, 'comparisons'),
      comparisons_test: sum(set.cohorts, 'comparisons_test'),
      open: set.cohorts.some((c) => c.open),
    }));
  }, [cohortStats]);

  // A set that is counting opens itself; the rest wait to be asked.
  const [open, setOpen] = useState(() => new Set());
  useEffect(() => {
    setOpen((prev) => (prev.size ? prev : new Set(sets.filter((s) => s.open).map((s) => s.key))));
  }, [sets]);

  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const testMarks = sets.reduce((n, s) => n + s.comparisons_test, 0);

  return (
    <div className="space-y-3">
      {/* Six numbers, three across on a phone: the whole count stays inside one screen
          so the reading is a dashboard rather than a scroll. */}
      <div className="grid grid-cols-3 gap-1.5 md:gap-2 lg:grid-cols-6">
        {TILES.map(({ key, label, hint, icon: Icon }) => (
          <div
            key={key}
            className="rounded-lg border border-editorial-navy/10 bg-white px-2 py-1.5 shadow-sm md:px-3 md:py-2.5"
          >
            <div className="flex items-center gap-1 text-editorial-navy/50 md:gap-1.5">
              <Icon className="hidden h-3 w-3 shrink-0 md:block" />
              <span className="truncate text-[7.5px] font-bold uppercase tracking-[0.12em] md:text-[9px] md:tracking-[0.2em]">
                {label}
              </span>
            </div>
            <p className="mt-0.5 font-heading text-[16px] leading-none tabular-nums text-editorial-navy md:mt-1 md:text-[22px]">
              {fmt(totals?.[key])}
            </p>
            <p className="mt-0.5 hidden text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/40 md:mt-1 md:block">
              {hint}
            </p>
          </div>
        ))}
      </div>

      {sets.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-editorial-navy/10 bg-editorial-cream">
          {sets.map((set) => {
            const expanded = open.has(set.key);
            return (
              <div key={set.key} className="border-t border-editorial-navy/10 first:border-t-0">
                <button
                  type="button"
                  onClick={() => toggle(set.key)}
                  aria-expanded={expanded}
                  className="flex w-full flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-2 text-left hover:bg-white/70"
                >
                  <ChevronDown
                    className={`h-3 w-3 shrink-0 text-editorial-navy/40 transition-transform ${expanded ? '' : '-rotate-90'}`}
                  />
                  <span className="font-heading text-[13px] text-editorial-navy">{set.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-editorial-navy/40">
                    {set.cohorts.length} {set.cohorts.length === 1 ? 'cohort' : 'cohorts'}
                  </span>
                  <span className="text-[11px] tabular-nums text-editorial-navy/55">
                    {fmt(set.pool)} standing · {fmt(set.ballots)} ballots · {fmt(set.seeded)} seeded ·{' '}
                    {fmt(set.comparisons)} marks
                  </span>
                  {mode !== 'internal' && set.comparisons_test > 0 && (
                    <span className="text-[10px] tabular-nums uppercase tracking-[0.12em] text-editorial-label/80">
                      + {fmt(set.comparisons_test)} test
                    </span>
                  )}
                  <span
                    className="ml-auto text-[10px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: set.open ? '#2E7D5B' : 'rgba(30,58,90,0.55)' }}
                  >
                    {set.open ? 'Counting' : 'Closed'}
                  </span>
                </button>

                {expanded && set.cohorts.map((cohort) => <CohortLine key={cohort.season_id} cohort={cohort} />)}
              </div>
            );
          })}
        </div>
      )}

      {testMarks > 0 && (
        <p className="rounded-md border-l-2 border-editorial-copper bg-editorial-cream/70 px-3 py-2 text-[10.5px] leading-relaxed text-editorial-navy/65">
          {mode === 'internal' ? (
            <>
              <span className="font-semibold text-editorial-navy">
                {fmt(totals?.comparisons)} marks are internal sets.
              </span>{' '}
              Cast by administrators, stamped as they were written, and never scored: they move no rating, no appearance
              count and no contributor's ladder. This reading exists so the platform can keep a baseline of its own.
            </>
          ) : (
            <>
              <span className="font-semibold text-editorial-navy">{fmt(testMarks)} marks are test sets.</span> They are
              recorded so a walkthrough works end to end, stamped at the moment they are cast, and never scored: they do
              not move a rating, an appearance count or a contributor's ladder. Only real marks appear in the tiles above.
            </>
          )}
        </p>
      )}
    </div>
  );
}