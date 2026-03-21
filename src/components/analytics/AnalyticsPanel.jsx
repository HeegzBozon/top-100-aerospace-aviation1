import React, { useState, useEffect, useCallback } from 'react';
import { getAnalyticsData } from '@/functions/getAnalyticsData';
import { BarChart2, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import StatCard from './StatCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

function fmtDuration(secs) {
  const s = Math.round(Number(secs));
  if (isNaN(s)) return '—';
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

export default function AnalyticsPanel({ propertyId, onPropertyChange, properties }) {
  const [range, setRange] = useState(28);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    const res = await getAnalyticsData({
      propertyId,
      startDate: getDateDaysAgo(range),
      endDate: getDateDaysAgo(1),
    });
    if (res.data?.error) setError(res.data.error);
    else setData(res.data);
    setLoading(false);
  }, [propertyId, range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Parse overview rows into chart data
  const overviewRows = data?.overview?.rows || [];
  const dimensionHeaders = data?.overview?.dimensionHeaders || [];
  const metricHeaders = data?.overview?.metricHeaders || [];

  const dateIdx = dimensionHeaders.findIndex(h => h.name === 'date');
  const getMetricIdx = (name) => metricHeaders.findIndex(h => h.name === name);

  const chartData = overviewRows.map(row => {
    const date = row.dimensionValues?.[dateIdx]?.value || '';
    const fmt = date.length === 8
      ? `${date.slice(4, 6)}/${date.slice(6, 8)}`
      : date;
    return {
      date: fmt,
      sessions: Number(row.metricValues?.[getMetricIdx('sessions')]?.value || 0),
      users: Number(row.metricValues?.[getMetricIdx('activeUsers')]?.value || 0),
      pageviews: Number(row.metricValues?.[getMetricIdx('screenPageViews')]?.value || 0),
    };
  });

  const totals = chartData.reduce(
    (acc, r) => ({
      sessions: acc.sessions + r.sessions,
      users: acc.users + r.users,
      pageviews: acc.pageviews + r.pageviews,
    }),
    { sessions: 0, users: 0, pageviews: 0 }
  );

  const avgBounce = overviewRows.length
    ? (
        overviewRows.reduce(
          (s, r) => s + Number(r.metricValues?.[getMetricIdx('bounceRate')]?.value || 0),
          0
        ) / overviewRows.length * 100
      ).toFixed(1)
    : null;

  const topPages = data?.topPages?.rows || [];
  const pageMetricHeaders = data?.topPages?.metricHeaders || [];
  const pageDimHeaders = data?.topPages?.dimensionHeaders || [];
  const pathIdx = pageDimHeaders.findIndex(h => h.name === 'pagePath');
  const pvIdx = pageMetricHeaders.findIndex(h => h.name === 'screenPageViews');
  const durationIdx = pageMetricHeaders.findIndex(h => h.name === 'averageSessionDuration');

  return (
    <section aria-labelledby="ga-heading" className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <h2 id="ga-heading" className="text-sm font-semibold text-white">Google Analytics</h2>
          {properties?.length > 0 && (
            <div className="relative">
              <select
                value={propertyId || ''}
                onChange={e => onPropertyChange?.(e.target.value)}
                className="appearance-none bg-slate-700 text-slate-300 text-xs rounded-lg pl-3 pr-7 py-1.5 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[36px]"
                aria-label="Select GA4 property"
              >
                <option value="">Select property…</option>
                {properties.map(p => (
                  <option key={p.name} value={p.name}>{p.displayName || p.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
        <div className="flex gap-1" role="group" aria-label="Date range">
          {RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors min-h-[36px] ${
                range === r.days
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              aria-pressed={range === r.days}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!propertyId && (
        <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-sm text-center">
          Select a GA4 property above to load data.
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Sessions" value={totals.sessions.toLocaleString()} />
            <StatCard label="Users" value={totals.users.toLocaleString()} />
            <StatCard label="Pageviews" value={totals.pageviews.toLocaleString()} />
            <StatCard label="Bounce Rate" value={avgBounce ? `${avgBounce}%` : '—'} />
          </div>

          {chartData.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">Sessions over time</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {topPages.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm" aria-label="Top pages table">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-4 py-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">Page</th>
                    <th className="text-right px-4 py-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">Views</th>
                    <th className="text-right px-4 py-2.5 text-xs text-slate-400 font-medium uppercase tracking-wider">Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {topPages.map((row, i) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-2.5 text-slate-200 truncate max-w-xs font-mono text-xs">
                        {row.dimensionValues?.[pathIdx]?.value}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-300">
                        {Number(row.metricValues?.[pvIdx]?.value || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-300">
                        {fmtDuration(row.metricValues?.[durationIdx]?.value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}