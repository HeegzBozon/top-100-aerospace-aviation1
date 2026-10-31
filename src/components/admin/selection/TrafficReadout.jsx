import { useEffect, useState } from 'react';
import { getAnalyticsData } from '@/functions/getAnalyticsData';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';

// The other ledger: who is arriving. Read from the app's Google Analytics property over
// the last four weeks — three figures at a glance, and the shape of the days behind them.

const DAYS = 28;

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

function fmt(value) {
  return typeof value === 'number' ? value.toLocaleString() : '—';
}

function Figure({ label, value }) {
  return (
    <div>
      <p className="text-[7.5px] font-bold uppercase tracking-[0.16em] text-editorial-navy/40">{label}</p>
      <p className="mt-0.5 font-heading text-[20px] leading-none tabular-nums text-editorial-navy md:text-[24px]">
        {fmt(value)}
      </p>
    </div>
  );
}

export default function TrafficReadout() {
  const [state, setState] = useState('loading');
  const [series, setSeries] = useState([]);
  const [totals, setTotals] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const listed = await getAnalyticsData({});
        const properties = listed?.data?.properties || [];
        const known = properties.find((p) => p.name?.includes('FKVD6VNDVS') || p.displayName);
        const propertyId = known?.name || properties[0]?.name;
        if (!propertyId) {
          if (!cancelled) setState('empty');
          return;
        }

        const res = await getAnalyticsData({ propertyId, startDate: daysAgo(DAYS), endDate: daysAgo(1) });
        if (cancelled) return;
        if (res?.data?.error) {
          setState('error');
          return;
        }

        const rows = res?.data?.overview?.rows || [];
        const headers = res?.data?.overview?.metricHeaders || [];
        const at = (name) => headers.findIndex((h) => h.name === name);
        const num = (row, name) => Number(row?.metricValues?.[at(name)]?.value || 0);

        const days = rows.map((row) => ({
          users: num(row, 'activeUsers'),
          sessions: num(row, 'sessions'),
          views: num(row, 'screenPageViews'),
        }));

        setSeries(days);
        setTotals(days.reduce(
          (acc, d) => ({
            users: acc.users + d.users,
            sessions: acc.sessions + d.sessions,
            views: acc.views + d.views,
          }),
          { users: 0, sessions: 0, views: 0 }
        ));
        setState('ready');
      } catch {
        if (!cancelled) setState('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-lg border border-editorial-navy/10 bg-white px-2.5 py-2 shadow-sm">
      <div className="flex items-baseline justify-between">
        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-navy/45">Site traffic</p>
        <p className="text-[8px] uppercase tracking-[0.12em] text-editorial-navy/35">{DAYS} days</p>
      </div>

      {state === 'ready' ? (
        <>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            <Figure label="Users" value={totals?.users} />
            <Figure label="Sessions" value={totals?.sessions} />
            <Figure label="Views" value={totals?.views} />
          </div>
          <div className="mt-1 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#B87333"
                  strokeWidth={1.2}
                  fill="#B87333"
                  fillOpacity={0.14}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-editorial-navy/35">
          {state === 'loading' ? 'Reading traffic' : state === 'empty' ? 'No property' : 'Traffic unavailable'}
        </p>
      )}
    </div>
  );
}