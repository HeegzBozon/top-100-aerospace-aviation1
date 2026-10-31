import { useEffect, useState } from 'react';
import { getAnalyticsData } from '@/functions/getAnalyticsData';

// The other ledger: who is arriving. Read from the app's Google Analytics property over
// the last four weeks, so the monitor can carry traffic beside the votes it is watching.

const DAYS = 28;

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export default function useSiteTraffic(days = DAYS) {
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

        const res = await getAnalyticsData({ propertyId, startDate: daysAgo(days), endDate: daysAgo(1) });
        if (cancelled) return;
        if (res?.data?.error) {
          setState('error');
          return;
        }

        const rows = res?.data?.overview?.rows || [];
        const headers = res?.data?.overview?.metricHeaders || [];
        const at = (name) => headers.findIndex((h) => h.name === name);
        const num = (row, name) => Number(row?.metricValues?.[at(name)]?.value || 0);

        const readings = rows.map((row) => ({
          users: num(row, 'activeUsers'),
          sessions: num(row, 'sessions'),
          views: num(row, 'screenPageViews'),
        }));

        setSeries(readings);
        setTotals(readings.reduce(
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
  }, [days]);

  return { state, series, totals, days };
}