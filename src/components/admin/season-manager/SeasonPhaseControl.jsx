import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { GROUP_PHASES, STATUS_CONFIG } from './seasonStatusConfig';
import { cohortName } from './seasonGrouping';
import { setCohortsStatus } from './seasonApi';
import ArchiveSeasonButton from './ArchiveSeasonButton';

// One control that moves every active cohort of a season into the same phase.
export default function SeasonPhaseControl({ cohorts, onChanged }) {
  const [busy, setBusy] = useState(null);
  const { toast } = useToast();
  const live = cohorts.filter((c) => c.status !== 'archived');
  const statuses = [...new Set(live.map((c) => c.status))];
  const current = statuses.length === 1 ? statuses[0] : null;
  if (!live.length) return null;

  const move = async (phase) => {
    if (phase.status === current) return;
    if (phase.status === 'voting_open') {
      const counts = await Promise.all(live.map((c) => base44.entities.Nominee.filter({ season_id: c.id, status: { $in: ['approved', 'active'] } }, '-created_date', 2)));
      const thin = live.filter((_, i) => counts[i].length < 2);
      if (thin.length) {
        toast({ variant: 'destructive', title: 'Cannot open voting', description: `${thin.map(cohortName).join(', ')} need at least 2 nominees in the pool.` });
        return;
      }
    }
    const unfinalized = phase.status === 'voting_open' ? live.filter((c) => !c.pool_finalized_at) : [];
    const warn = unfinalized.length ? `\n\nPool not yet finalized: ${unfinalized.map(cohortName).join(', ')}.` : '';
    if (!confirm(`Move all ${live.length} cohorts to ${phase.label}?${warn}`)) return;
    setBusy(phase.status);
    await setCohortsStatus(live, phase.status);
    setBusy(null);
    toast({ title: `Season moved to ${phase.label}` });
    onChanged();
  };

  return (
    <section className="rounded-2xl bg-white border border-editorial-navy/10 px-6 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <h3 className="font-heading text-lg text-editorial-navy">Season phase</h3>
        <p className="text-xs text-editorial-navy/60">{current ? `All cohorts in ${STATUS_CONFIG[current]?.label}` : 'Cohorts are in different phases — pick one to align them'}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap rounded-lg border border-editorial-navy/15 overflow-hidden">
          {GROUP_PHASES.map((p) => {
            const on = p.status === current;
            return (
              <button key={p.status} disabled={!!busy} onClick={() => move(p)}
                className={`px-4 py-2 text-sm font-medium border-r last:border-r-0 border-editorial-navy/10 transition-colors ${on ? 'bg-editorial-copper text-white' : 'text-editorial-navy hover:bg-editorial-gold/15'}`}>
                {busy === p.status ? <Loader2 className="w-4 h-4 animate-spin" /> : p.label}
              </button>
            );
          })}
        </div>
        {current === 'completed' && <ArchiveSeasonButton seasons={live} label="Archive season" onArchived={onChanged} />}
      </div>
    </section>
  );
}