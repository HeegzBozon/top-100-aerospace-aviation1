import { Check } from 'lucide-react';
import { INTAKE_TRACKS } from './seasonGrouping';

// Four lifecycle stages from intake to an activated pool. Dedup + orphans resolve inside Finalize Pool.
export default function CohortLifecycleStrip({ season, backlogCount }) {
  const finalized = !!season.pool_finalized_at;
  const hasTrack = INTAKE_TRACKS.includes(season.cohort_key);
  const stages = [
    { label: 'Intake', done: finalized || (hasTrack && backlogCount === 0), note: hasTrack && !finalized && backlogCount ? `${backlogCount} open` : null },
    { label: 'Dedup', done: finalized },
    { label: 'Orphans', done: finalized },
    { label: 'Activated', done: finalized },
  ];
  return (
    <ol className="grid grid-cols-4 gap-1.5">
      {stages.map((s, i) => (
        <li key={s.label} className={`rounded-md px-2 py-1.5 border text-center ${s.done ? 'border-editorial-copper/40 bg-editorial-copper/5' : 'border-editorial-navy/10'}`}>
          <span className={`flex items-center justify-center gap-1 text-[10px] uppercase tracking-[0.14em] font-semibold ${s.done ? 'text-editorial-copper' : 'text-editorial-navy/45'}`}>
            {s.done ? <Check className="w-3 h-3" /> : <span className="tabular-nums">{i + 1}</span>}
            {s.label}
          </span>
          {s.note && <span className="block text-[10px] text-editorial-navy/60 mt-0.5">{s.note}</span>}
        </li>
      ))}
    </ol>
  );
}