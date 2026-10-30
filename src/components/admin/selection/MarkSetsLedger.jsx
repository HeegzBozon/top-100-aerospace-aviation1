import { Fragment, useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// The marks, read as the sets they were cast in. One anchor judgement files five to seven
// pairs in a single write: that write is the set, and the pairs are its detail. Printing
// every pair as its own row made one decision look like six.

function when(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function MarkSetsLedger({ marks = [] }) {
  const [query, setQuery] = useState('');
  const [showTest, setShowTest] = useState(true);
  const [open, setOpen] = useState(() => new Set());

  const sets = useMemo(() => {
    const map = new Map();
    marks.forEach((row) => {
      const key = row.set_key || `${row.voter_email}|${row.at}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          voter_name: row.voter_name,
          voter_email: row.voter_email,
          at: row.at,
          cohort: row.cohort,
          is_test: !!row.is_test,
          voter_role: row.voter_role || null,
          pairs: [],
        });
      }
      map.get(key).pairs.push(row);
    });
    return [...map.values()].sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  }, [marks]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const scoped = showTest ? sets : sets.filter((s) => !s.is_test);
    if (!needle) return scoped;
    return scoped.filter((set) =>
      [set.voter_name, set.voter_email, set.cohort, ...set.pairs.flatMap((p) => [p.winner, p.loser])].some((value) =>
        String(value || '').toLowerCase().includes(needle)
      ));
  }, [sets, query, showTest]);

  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const testCount = sets.filter((s) => s.is_test).length;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-editorial-navy/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a voter, a name or a cohort"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-3">
          {testCount > 0 && (
            <button
              type="button"
              onClick={() => setShowTest((value) => !value)}
              className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-editorial-navy/45 hover:text-editorial-navy"
            >
              Test sets {showTest ? 'shown' : 'hidden'}
            </button>
          )}
          <p className="text-[10px] uppercase tracking-[0.16em] text-editorial-navy/45">
            {visible.length} of {sets.length} sets
          </p>
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto rounded-lg border border-editorial-navy/10 bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-editorial-navy text-editorial-cream">
            <tr>
              <th className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.16em]">Voter</th>
              <th className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.16em]">Set</th>
              <th className="px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.16em]">Cohort</th>
              <th className="px-2.5 py-2 text-right text-[9px] font-bold uppercase tracking-[0.16em]">Cast</th>
              <th className="w-6 px-1 py-2" />
            </tr>
          </thead>
          <tbody>
            {visible.map((set) => {
              const expanded = open.has(set.key);
              return (
                <Fragment key={set.key}>
                  <tr
                    onClick={() => toggle(set.key)}
                    className="cursor-pointer border-t border-editorial-navy/10 hover:bg-editorial-cream/70"
                  >
                    <td className="px-2.5 py-1.5">
                      <p className="text-[12px] font-semibold leading-tight text-editorial-navy">{set.voter_name}</p>
                      <p className="text-[10px] leading-tight text-editorial-navy/45">{set.voter_email}</p>
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-1.5">
                      <span className="text-[11px] tabular-nums text-editorial-navy">
                        {set.pairs.length} {set.pairs.length === 1 ? 'pair' : 'pairs'}
                      </span>
                      {(set.voter_role === 'admin' || set.is_test) && (
                        <span className="ml-2 rounded-sm bg-editorial-copper/15 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.14em] text-editorial-label">
                          {set.voter_role === 'admin' ? 'Admin' : 'Test'}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-[10.5px] uppercase tracking-[0.12em] text-editorial-navy/60">
                      {set.cohort || '—'}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-right text-[11px] tabular-nums text-editorial-navy/60">
                      {when(set.at)}
                    </td>
                    <td className="px-1 py-1.5">
                      <ChevronDown
                        className={`h-3 w-3 text-editorial-navy/40 transition-transform ${expanded ? '' : '-rotate-90'}`}
                      />
                    </td>
                  </tr>

                  {expanded && (
                    <tr className="bg-editorial-cream/60">
                      <td colSpan={5} className="px-3 py-2">
                        <ul className="space-y-1">
                          {set.pairs.map((pair) => (
                            <li key={pair.id} className="flex flex-wrap items-baseline gap-1.5 text-[11.5px]">
                              <span className="font-semibold text-editorial-navy">{pair.winner}</span>
                              <span className="text-editorial-navy/45">preferred over</span>
                              <span className="text-editorial-navy/75">{pair.loser}</span>
                            </li>
                          ))}
                        </ul>
                        {(set.voter_role === 'admin' || set.is_test) && (
                          <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-editorial-label/80">
                            {set.voter_role === 'admin'
                              ? 'Admin review set · recorded, never scored'
                              : 'Test set · recorded, never scored'}
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-[12px] text-editorial-navy/55">
                  {marks.length === 0
                    ? 'No marks recorded in this scope yet. The ledger fills as the community weighs.'
                    : `Nothing matches “${query}”.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-editorial-navy/45">
        A set is one judgement: the pairs filed together when a voter weighed a group. Every mark is recorded against
        the voter who cast it; the ballot behind it stays sealed.
      </p>
    </div>
  );
}