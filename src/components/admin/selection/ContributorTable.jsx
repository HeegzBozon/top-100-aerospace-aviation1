import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Who is doing the weighing. Progress only: this ladder is feedback, and it never moves a
// nominee's position.

const COLUMNS = [
  { key: 'fellow_name', label: 'Fellow' },
  { key: 'level', label: 'Level', numeric: true },
  { key: 'xp', label: 'XP', numeric: true },
  { key: 'sets_completed', label: 'Sets', numeric: true },
  { key: 'ballots_saved', label: 'Ballots', numeric: true },
  { key: 'comparisons_recorded', label: 'Marks', numeric: true },
  { key: 'last_action_at', label: 'Last seen', numeric: true },
];

function when(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ContributorTable({ rows = [] }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: 'xp', dir: 'desc' });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((r) => [r.fellow_name, r.fellow_email, r.level_name].some((v) => String(v || '').toLowerCase().includes(needle)))
      : rows;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = a[sort.key];
      const y = b[sort.key];
      if (sort.key === 'last_action_at') return ((new Date(x || 0)).getTime() - (new Date(y || 0)).getTime()) * dir;
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x ?? '').localeCompare(String(y ?? '')) * dir;
    });
  }, [rows, query, sort]);

  const toggle = (key) =>
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-editorial-navy/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a Fellow"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <p className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-editorial-navy/45">
          {visible.length} of {rows.length} shown
        </p>
      </div>

      <div className="max-h-[520px] overflow-auto rounded-lg border border-editorial-navy/10 bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-editorial-navy text-editorial-cream">
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`whitespace-nowrap px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.16em] ${
                    col.numeric ? 'text-right' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(col.key)}
                    className="inline-flex items-center gap-1 uppercase tracking-[0.16em] hover:text-editorial-gold"
                  >
                    {col.label}
                    {sort.key === col.key &&
                      (sort.dir === 'desc' ? <ArrowDown className="h-2.5 w-2.5" /> : <ArrowUp className="h-2.5 w-2.5" />)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.fellow_email} className="border-t border-editorial-navy/10 hover:bg-editorial-cream/70">
                <td className="px-2.5 py-1.5">
                  <p className="text-[12px] font-semibold leading-tight text-editorial-navy">{row.fellow_name}</p>
                  <p className="text-[10px] leading-tight text-editorial-navy/45">{row.fellow_email}</p>
                </td>
                <td className="whitespace-nowrap px-2.5 py-1.5 text-right text-[11px] text-editorial-navy">
                  <span className="font-semibold tabular-nums">{row.level}</span>
                  <span className="ml-1 text-[10px] uppercase tracking-[0.12em] text-editorial-navy/50">
                    {row.level_name || ''}
                  </span>
                </td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy">{row.xp}</td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy/75">{row.sets_completed}</td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy/75">{row.ballots_saved}</td>
                <td className="px-2.5 py-1.5 text-right text-[11.5px] tabular-nums text-editorial-navy/75">{row.comparisons_recorded}</td>
                <td className="whitespace-nowrap px-2.5 py-1.5 text-right text-[11px] tabular-nums text-editorial-navy/60">
                  {when(row.last_action_at)}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-3 py-10 text-center text-[12px] text-editorial-navy/55">
                  {rows.length === 0
                    ? 'No contribution recorded in this scope yet.'
                    : `Nothing matches “${query}”.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}