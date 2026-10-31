import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// The dive: the same totals cut by edition, and inside each edition by cohort. The bar
// beside every set is its share of the marks in view, so the field's weight is read as
// shape before it is read as numbers.

function fmt(value) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

function windowState(cohort) {
  if (cohort.open) return { text: 'Counting', tone: '#2E7D5B' };
  if (cohort.within_window) return { text: 'In window', tone: '#8F5C2C' };
  return { text: 'Closed', tone: 'rgba(30,58,90,0.45)' };
}

export default function CohortDive({ cohortStats = [], mode = 'live' }) {
  const sets = useMemo(() => {
    const map = new Map();
    cohortStats.forEach((c) => {
      const key = c.set_id || c.season_id;
      if (!map.has(key)) map.set(key, { key, name: c.set_name || c.label, cohorts: [] });
      map.get(key).cohorts.push(c);
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

  const widest = Math.max(1, ...sets.map((s) => s.comparisons));

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

  if (!sets.length) return null;

  return (
    <div>
      <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-navy/40">By edition</p>
      <div className="overflow-hidden rounded-lg border border-editorial-navy/10 bg-white">
        {sets.map((set) => {
          const expanded = open.has(set.key);
          const share = Math.round((set.comparisons / widest) * 100);
          return (
            <div key={set.key} className="border-t border-editorial-navy/10 first:border-t-0">
              <button
                type="button"
                onClick={() => toggle(set.key)}
                aria-expanded={expanded}
                className="w-full px-2.5 py-1.5 text-left hover:bg-editorial-cream/60"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown
                    className={`h-3 w-3 shrink-0 text-editorial-navy/40 transition-transform ${
                      expanded ? '' : '-rotate-90'
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate font-heading text-[12.5px] text-editorial-navy">{set.name}</span>
                  <span
                    className="shrink-0 text-[8px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: set.open ? '#2E7D5B' : 'rgba(30,58,90,0.45)' }}
                  >
                    {set.open ? 'Counting' : 'Closed'}
                  </span>
                </div>
                <div className="mt-1 flex h-1 overflow-hidden rounded-full bg-editorial-cream">
                  <span
                    className={set.open ? 'bg-editorial-copper' : 'bg-editorial-navy/30'}
                    style={{ width: `${share}%` }}
                  />
                </div>
                <div className="mt-1 flex flex-wrap gap-x-2 text-[8.5px] uppercase tracking-[0.08em] text-editorial-navy/45">
                  <span className="tabular-nums">{fmt(set.pool)} standing</span>
                  <span className="tabular-nums">{fmt(set.ballots)} ballots</span>
                  <span className="tabular-nums">{fmt(set.seeded)} seeded</span>
                  <span className="ml-auto tabular-nums font-semibold text-editorial-navy/70">
                    {fmt(set.comparisons)} marks
                  </span>
                </div>
              </button>

              {expanded &&
                set.cohorts.map((cohort) => {
                  const state = windowState(cohort);
                  return (
                    <div
                      key={cohort.season_id}
                      className="flex flex-wrap items-baseline gap-x-2 border-t border-editorial-navy/10 bg-editorial-cream/40 py-1 pl-7 pr-2.5 text-[8.5px] uppercase tracking-[0.08em] text-editorial-navy/50"
                    >
                      <span className="font-heading text-[11px] normal-case tracking-normal text-editorial-navy">
                        {cohort.label}
                      </span>
                      <span className="tabular-nums">
                        {fmt(cohort.pool)} · {fmt(cohort.ballots)} · {fmt(cohort.comparisons)}
                      </span>
                      <span className="ml-auto font-semibold" style={{ color: state.tone }}>
                        {state.text}
                      </span>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
      <p className="mt-1 text-[8px] uppercase tracking-[0.12em] text-editorial-navy/35">
        {mode === 'internal' ? 'Standing · ballots · internal marks' : 'Standing · ballots · marks'}
      </p>
    </div>
  );
}