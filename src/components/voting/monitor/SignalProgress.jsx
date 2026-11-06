import { Activity } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';

// How deep the counting cohort's analysis runs. A review is four records weighed, so the
// rungs are the ballot's own milestone list read across the whole cohort: how many Fellows
// have analysed ten reviews, twenty-five, and so on. Figures, never a forecast — nothing
// here is extrapolated from the pace.
export default function SignalProgress({ data, loading }) {
  const voters = data?.voters || 0;
  const reviews = data?.reviews ?? 0;
  const rungs = data?.rungs || [];

  const figures = [
    { label: 'Reviews', value: reviews },
    { label: 'Voters', value: voters },
    { label: 'Last 15m', value: data?.recentComparisons ?? 0 },
  ];

  return (
    <div className="mt-3">
      <div className="grid grid-cols-3 gap-2">
        {figures.map((f) => (
          <div key={f.label} className="rounded-lg px-2 py-1.5" style={{ background: `${brand.navy}08` }}>
            <p className="font-heading text-[15px] leading-none" style={{ color: brand.navy }}>
              {loading && !data ? '—' : f.value}
            </p>
            <p
              className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em]"
              style={{ color: ink.soft }}
            >
              {f.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: ink.soft }}>
            Fellows past each rung
          </p>
          <p className="text-[8.5px]" style={{ color: ink.soft }}>
            {data?.comparisons ?? 0} comparisons
          </p>
        </div>

        {loading && !data ? (
          <div className="mt-2 space-y-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded" style={{ background: `${brand.navy}06` }} />
            ))}
          </div>
        ) : voters > 0 ? (
          <ul className="mt-2">
            {rungs.map((rung) => {
              const share = Math.min(1, rung.reached / voters);
              return (
                <li key={rung.sets} className="flex items-center gap-2 py-[3px]">
                  <span className="w-8 shrink-0 text-[9px] font-bold tabular-nums" style={{ color: ink.body }}>
                    {rung.sets}
                  </span>
                  <span
                    className="relative h-1.5 flex-1 overflow-hidden rounded-full"
                    style={{ background: `${brand.navy}0C` }}
                  >
                    <span
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${Math.round(share * 100)}%`, background: `linear-gradient(90deg, #B87333, ${brand.gold})` }}
                    />
                  </span>
                  <span
                    className="w-5 shrink-0 text-right text-[9.5px] font-semibold tabular-nums"
                    style={{ color: rung.reached ? brand.navy : ink.soft }}
                  >
                    {rung.reached}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-2 rounded-lg px-3 py-4 text-center" style={{ background: `${brand.navy}05` }}>
            <Activity className="mx-auto h-3.5 w-3.5" style={{ color: ink.soft }} />
            <p className="mt-1.5 font-heading text-[11px]" style={{ color: brand.navy }}>
              No analysis yet
            </p>
            <p className="mt-0.5 text-[9px] leading-snug" style={{ color: ink.soft }}>
              The rungs fill as Fellows record their reviews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}