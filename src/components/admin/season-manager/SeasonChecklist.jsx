import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INTAKE_TRACKS, cohortName, isDone, isVotingConfigured, isScoringBalanced } from './seasonGrouping';

function buildItems(group, cohorts, backlog, act) {
  const items = [
    { key: 'dated', label: 'Season named and dated', done: !!(group.name && group.start_date && group.end_date), action: { label: 'Edit season', run: () => act.onEdit(group) } },
    { key: 'cohorts', label: 'Cohorts defined', detail: cohorts.length ? cohorts.map(cohortName).join(' · ') : null, done: cohorts.length > 0, action: { label: 'Add cohort', run: act.onAddCohort } },
  ];
  const unvoted = cohorts.find((c) => !isVotingConfigured(c));
  items.push({ key: 'voting', label: 'Voting modes set for every cohort', done: cohorts.length > 0 && !unvoted, action: unvoted && { label: `Configure ${cohortName(unvoted)}`, run: () => act.onEdit(unvoted) } });
  const unbalanced = cohorts.find((c) => !isScoringBalanced(c));
  items.push({ key: 'scoring', label: 'Scoring weights total 100%', done: cohorts.length > 0 && !unbalanced, action: unbalanced && { label: `Configure ${cohortName(unbalanced)}`, run: () => act.onEdit(unbalanced) } });

  cohorts.filter((c) => !isDone(c)).forEach((c) => {
    const finalized = !!c.pool_finalized_at;
    if (INTAKE_TRACKS.includes(c.cohort_key)) {
      const open = backlog[c.cohort_key] || 0;
      items.push({ key: `intake-${c.id}`, label: `${cohortName(c)} — nomination intake reviewed`, detail: !finalized && open ? `${open} awaiting review` : null, done: finalized || open === 0, action: { label: 'Open intake', run: () => act.onNavigate?.('nomination-intake') } });
    }
    items.push({ key: `pool-${c.id}`, label: `${cohortName(c)} — pool finalized`, detail: finalized ? `Activated ${new Date(c.pool_finalized_at).toLocaleDateString()}` : 'Pre-flight · dedup · orphans · activate', done: finalized, action: { label: 'Finalize pool', run: () => act.onFinalize(c) } });
  });
  return items;
}

export default function SeasonChecklist({ group, cohorts, backlog, actions }) {
  const items = buildItems(group, cohorts, backlog, actions);
  const nextKey = items.find((i) => !i.done)?.key;
  const doneCount = items.filter((i) => i.done).length;
  return (
    <section className="rounded-2xl bg-white border border-editorial-navy/10">
      <header className="flex items-baseline justify-between px-6 pt-5 pb-3 border-b border-editorial-copper/40">
        <h3 className="font-heading text-lg text-editorial-navy">Setup & lifecycle</h3>
        <p className="text-xs text-editorial-navy/60 tabular-nums">{doneCount} of {items.length} complete</p>
      </header>
      <ol className="divide-y divide-editorial-navy/5">
        {items.map((item, i) => {
          const isNext = item.key === nextKey;
          return (
            <li key={item.key} className={`flex items-center gap-4 px-6 py-3 ${isNext ? 'bg-editorial-gold/10' : ''}`}>
              <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-semibold ${item.done ? 'bg-editorial-copper text-white' : 'border border-editorial-navy/20 text-editorial-navy/60'}`}>
                {item.done ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.done ? 'text-editorial-navy/55' : 'text-editorial-navy font-medium'}`}>{item.label}</p>
                {item.detail && <p className="text-xs text-editorial-navy/50 truncate">{item.detail}</p>}
              </div>
              {isNext && <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-editorial-copper font-bold">Next</span>}
              {!item.done && item.action && (
                <Button size="sm" variant={isNext ? 'default' : 'ghost'} onClick={item.action.run}
                  className={isNext ? 'bg-editorial-copper hover:bg-editorial-copper/90 text-white' : 'text-editorial-navy'}>
                  {item.action.label} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}