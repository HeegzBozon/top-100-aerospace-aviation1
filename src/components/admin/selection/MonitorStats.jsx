import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import useSiteTraffic from './useSiteTraffic';

// The monitor's head strip: the counts the ledger is producing, then the audience it is
// producing them for. Everything else on the surface is the dive under these figures.

const num = (value) => (Number(value) || 0).toLocaleString();

const FIGURES = [
  { key: 'ballots', label: 'Ballots' },
  { key: 'comparisons', label: 'Marks' },
  { key: 'pool', label: 'In pool' },
  { key: 'contributors', label: 'Fellows' },
];

const TRAFFIC = [
  { key: 'users', label: 'Users' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'views', label: 'Views' },
];

export default function MonitorStats({ totals }) {
  const traffic = useSiteTraffic();

  return (
    <div className="space-y-1.5">
      <dl className="grid grid-cols-4 gap-1.5">
        {FIGURES.map((figure) => (
          <div
            key={figure.key}
            className="rounded-lg border border-editorial-navy/10 bg-white px-1.5 py-1.5"
          >
            <dt className="text-[8px] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-editorial-navy/45">
              {figure.label}
            </dt>
            <dd className="mt-0.5 font-heading text-[17px] leading-none tabular-nums text-editorial-navy">
              {num(totals?.[figure.key])}
            </dd>
          </div>
        ))}
      </dl>

      {/* Traffic, read from the property: three readings in one line, and the shape of
          the days behind them. */}
      <div className="flex items-center gap-2 rounded-lg border border-editorial-navy/10 bg-white px-2 py-1.5">
        <div className="shrink-0">
          <p className="text-[8px] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-editorial-navy/45">
            Site traffic
          </p>
          <p className="mt-0.5 text-[7.5px] uppercase tracking-[0.12em] text-editorial-navy/30">
            {traffic.days} days
          </p>
        </div>

        {traffic.state === 'ready' ? (
          <>
            <div className="flex flex-1 items-baseline justify-end gap-2.5">
              {TRAFFIC.map((reading) => (
                <div key={reading.key} className="text-right">
                  <p className="text-[7px] uppercase tracking-[0.1em] text-editorial-navy/35">{reading.label}</p>
                  <p className="text-[12px] font-semibold leading-none tabular-nums text-editorial-navy">
                    {num(traffic.totals?.[reading.key])}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-6 w-12 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={traffic.series} margin={{ top: 1, right: 0, bottom: 0, left: 0 }}>
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
          <p className="flex-1 text-right text-[8.5px] uppercase tracking-[0.12em] text-editorial-navy/35">
            {traffic.state === 'loading'
              ? 'Reading traffic'
              : traffic.state === 'empty'
                ? 'No property'
                : 'Traffic unavailable'}
          </p>
        )}
      </div>
    </div>
  );
}