import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import useSiteTraffic from './useSiteTraffic';
import { MARKS_PER_SITTING } from '@/lib/ballotMeasurement';
import EvaluatorLeaderboard from './EvaluatorLeaderboard';

// The monitor's head strip: the counts the ledger is producing, then the audience it is
// producing them for. Everything else on the surface is the dive under these figures.
//
// Three levels of the same record, in the order they are cast: a ballot is an evaluator's
// whole ordering, a mini ballot is one sitting of it — four cards, five evaluations — and an
// evaluation is one nominee weighed against another. Evaluations are counted in the reading
// on the glass.
//
// The Manifest stands beside them and is not one of them. A Manifest saves itself as it is
// built, so it carries names long before anything is cast from it — which is why it is read
// on its own line, and why a quiet ballot count is not read as an empty field.

const num = (value) => (Number(value) || 0).toLocaleString();

// The Manifest reads as two figures side by side — the orders saved, and the names they
// hold — so neither is ever mistaken for a ballot. The Evaluators count opens the ladder
// of who is doing the weighing.
const FIGURES = [
  { key: 'ballots', label: 'Ballots', note: 'whole orderings' },
  { key: 'mini', label: 'Mini ballots', note: 'four cards, five evaluations' },
  { key: 'comparisons', label: 'Evaluations', note: 'nominee against nominee' },
  { key: 'manifests', label: 'Manifests', note: 'orders, saved as built' },
  { key: 'manifest_entries', label: 'On Manifests', note: 'names ordered' },
  { key: 'pool', label: 'In pool', wide: true },
  { key: 'contributors', label: 'Evaluators', opensLadder: true },
];

// Each Manifest figure carries its own note, so the pair is read as orders and names.
const noteFor = (figure, totals) =>
  figure.key === 'manifests'
    ? `${num(totals?.manifest_people)} distinct people among the names ordered`
    : figure.key === 'manifest_entries'
      ? `${num(totals?.manifests)} orders, saved as built`
      : figure.note;

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

export default function MonitorStats({ totals, contributors = [] }) {
  const traffic = useSiteTraffic();
  const [ladder, setLadder] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-3 gap-1.5 md:grid-cols-7">
        {FIGURES.map((figure) => {
          const shell = `rounded-lg border border-editorial-navy/10 bg-white px-1.5 py-1.5 text-left ${
            figure.wide ? 'hidden md:block' : ''
          }`;
          const label = (
            <span className="flex items-baseline justify-between gap-1">
              <span className="text-[8px] font-semibold uppercase leading-[1.15] tracking-[0.12em] text-editorial-navy/45">
                {figure.label}
              </span>
              {figure.opensLadder && <ChevronRight className="h-2.5 w-2.5 shrink-0 text-editorial-copper/70" />}
            </span>
          );
          const value = (
            <span className="mt-0.5 block font-heading text-[17px] leading-none tabular-nums text-editorial-navy">
              {num(valueFor(figure, totals))}
            </span>
          );

          // One figure opens a panel: the evaluator ladder behind the count.
          return figure.opensLadder ? (
            <button
              key={figure.key}
              type="button"
              onClick={() => setLadder(true)}
              title={`${figure.note} · open the evaluator ladder`}
              className={`${shell} transition-colors hover:border-editorial-copper/50`}
            >
              {label}
              {value}
            </button>
          ) : (
            <div key={figure.key} title={noteFor(figure, totals)} className={shell}>
              {label}
              {value}
            </div>
          );
        })}
      </div>

      {/* The distinction the strip is read by: the order saves itself, the weighing is cast. */}
      <p className="text-[9px] uppercase tracking-[0.14em] text-editorial-navy/40">
        A Manifest saves itself as it is built · a ballot is cast in the Crosscheck
      </p>

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

      {/* Behind the Evaluators count: the ladder itself, and how much of the weighing each
          has done. Progress only — it never moves a nominee. */}
      <EvaluatorLeaderboard
        open={ladder}
        onOpenChange={setLadder}
        totals={totals}
        rows={contributors}
      />
    </div>
  );
}