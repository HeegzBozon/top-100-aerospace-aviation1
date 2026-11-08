import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import useSiteTraffic from './useSiteTraffic';
import { MARKS_PER_SITTING } from '@/lib/ballotMeasurement';

// The monitor's head strip: the counts the ledger is producing, then the audience it is
// producing them for. Everything else on the surface is the dive under these figures.
//
// Three levels of the same record, in the order they are cast: a ballot is a Fellow's
// whole ordering, a mini ballot is one sitting of it — four cards, five marks — and a mark
// is one nominee weighed against another. Marks are counted in the reading on the glass.

const num = (value) => (Number(value) || 0).toLocaleString();

const FIGURES = [
  { key: 'ballots', label: 'Ballots', note: 'whole orderings' },
  { key: 'mini', label: 'Mini ballots', note: 'four cards, five marks' },
  { key: 'comparisons', label: 'Marks', note: 'nominee against nominee' },
  { key: 'pool', label: 'In pool', wide: true },
  { key: 'contributors', label: 'Fellows', wide: true },
];

// A phone carries only the three levels of the vote itself; the audience behind them is a
// desk reading, and hiding it here leaves the signal instrument the head of the glass.

// A mini ballot is the set as the record writes it: five marks to the sitting, and a
// sitting is whole or it is not cast.
const valueFor = (total, totals) =>
  total.key === 'mini'
    ? Math.floor((Number(totals?.comparisons) || 0) / MARKS_PER_SITTING)
    : totals?.[total.key];

const TRAFFIC = [
  { key: 'users', label: 'Users' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'views', label: 'Views' },
];

export default function MonitorStats({ totals }) {
  const traffic = useSiteTraffic();

  return (
    <div className="space-y-1.5">
      <dl className="grid grid-cols-3 gap-1.5 md:grid-cols-5">
        {FIGURES.map((figure) => (
          <div
            key={figure.key}
            title={figure.note}
            className={`rounded-lg border border-editorial-navy/10 bg-white px-1.5 py-1.5 ${
              figure.wide ? 'hidden md:block' : ''
            }`}
          >
            <dt className="text-[8px] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-editorial-navy/45">
              {figure.label}
            </dt>
            <dd className="mt-0.5 font-heading text-[17px] leading-none tabular-nums text-editorial-navy">
              {num(valueFor(figure, totals))}
            </dd>
          </div>
        ))}
      </dl>

      {/* Traffic, read from the property: three readings in one line, and the shape of
          the days behind them. */}
      <div className="hidden items-center gap-2 rounded-lg border border-editorial-navy/10 bg-white px-2 py-1.5 md:flex">
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