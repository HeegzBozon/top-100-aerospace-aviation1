import { useState, useEffect, useCallback } from 'react';
import { getSearchConsoleData } from '@/functions/getSearchConsoleData';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import { useRecharts } from '@/lib/recharts-lazy';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '28d', days: 28 },
  { label: '90d', days: 90 },
];

function getDateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export default function SearchConsolePanel({ siteUrl }) {
  const rc = useRecharts();
  const [range, setRange] = useState(28);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!siteUrl) return;
    setLoading(true);
    setError(null);
    const res = await getSearchConsoleData({
      siteUrl,
      startDate: getDateDaysAgo(range),
      endDate: getDateDaysAgo(1),
      dimensions: ['query'],
      rowLimit: 25,
    });
    if (res.data?.error) setError(res.data.error);
    else setData(res.data);
    setLoading(false);
  }, [siteUrl, range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const rows = data?.rows || [];
  const totals = rows.reduce(
    (acc, r) => ({
      clicks: acc.clicks + (r.clicks || 0),
      impressions: acc.impressions + (r.impressions || 0),
    }),
    { clicks: 0, impressions: 0 }
  );
  const avgCtr = rows.length
    ? (rows.reduce((s, r) => s + (r.ctr || 0), 0) / rows.length * 100).toFixed(1)
    : null;
  const avgPos = rows.length
    ? (rows.reduce((s, r) => s + (r.position || 0), 0) / rows.length).toFixed(1)
    : null;

  const chartData = rows.slice(0, 15).map(r => ({
    name: r.keys?.[0]?.length > 20 ? r.keys?.[0]?.slice(0, 20) + '…' : r.keys?.[0],
    clicks: r.clicks,
    impressions: r.impressions,
  }));

  return (
    <section aria-labelledby="gsc-heading" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-indigo-400" />
          <h2 id="gsc-heading" className="text-sm font-semibold text-white">Search Console</h2>
          {siteUrl && <span className="text-xs text-slate-400 truncate max-w-xs">{siteUrl}</span>}
        </div>
        <div className="flex gap-1" role="group" aria-label="Date range">
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors min-h-[36px] ${
                range === r.days
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              aria-pressed={range === r.days}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && data && rc && (() => {
          const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = rc;
          return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Clicks" value={totals.clicks.toLocaleString()} />
            <StatCard label="Impressions" value={totals.impressions.toLocaleString()} />
            <StatCard label="Avg CTR" value={avgCtr ? `${avgCtr}%` : '—'} />
            <StatCard label="Avg Position" value={avgPos ?? '—'} />
          </div>

          {chartData.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Top Queries — Clicks</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="clicks" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {rows.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm" aria-label="Search queries table">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-4 py-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">Query</th>
                    <th className="text-right px-4 py-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">Clicks</th>
                    <th className="text-right px-4 py-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">Impr.</th>
                    <th className="text-right px-4 py-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">CTR</th>
                    <th className="text-right px-4 py-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">Pos.</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-2.5 text-slate-200 truncate max-w-xs">{row.keys?.[0]}</td>
                      <td className="px-4 py-2.5 text-right text-slate-300">{row.clicks}</td>
                      <td className="px-4 py-2.5 text-right text-slate-300">{row.impressions}</td>
                      <td className="px-4 py-2.5 text-right text-slate-300">{(row.ctr * 100).toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-right text-slate-300">{row.position?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
          );
      })()}
    </section>
  );
}