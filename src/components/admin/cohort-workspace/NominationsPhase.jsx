import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, ClipboardCheck, Users, Loader2 } from 'lucide-react';
import NomineeManager from '@/components/admin/NomineeManager';
import NominationIntakeManager from '@/components/admin/NominationIntakeManager';
import FinalizePoolPanel from '@/components/admin/finalize-pool/FinalizePoolPanel';
import RolloverPanel from '@/components/admin/cohort-workspace/RolloverPanel';

// Nominations phase — cohort-scoped triage, pool health, and Finalize Pool in one surface.
export default function NominationsPhase({ season, onSeasonsUpdate, seasons }) {
  const [count, setCount] = useState(null);
  const [showFinalize, setShowFinalize] = useState(false);

  useEffect(() => {
    setCount(null);
    base44.entities.Nominee
      .count({ $or: [{ season_ids: season.id }, { season_id: season.id }] })
      .then(setCount)
      .catch(() => setCount(null));
  }, [season.id]);

  return (
    <div className="space-y-6">
      {/* Pool health card */}
      <Card className="p-5 border-editorial-navy/15 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-editorial-navy/5 border border-editorial-navy/10 shrink-0">
              <Trophy className="w-5 h-5 text-editorial-copper" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-editorial-copper font-bold">Pool health</p>
              <h3 className="font-heading text-xl text-editorial-navy truncate">{season.cohort_label || season.name}</h3>
              <p className="text-sm text-editorial-navy/60">
                {count === null ? (
                  <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> counting nominees…</span>
                ) : (
                  <>{count} nominees in this cohort{season.pool_finalized_at ? ` · finalized ${new Date(season.pool_finalized_at).toLocaleDateString()}` : ''}</>
                )}
              </p>
            </div>
          </div>
          <Button onClick={() => setShowFinalize((s) => !s)} className="bg-editorial-copper hover:bg-editorial-copper/90 text-white shrink-0">
            <ClipboardCheck className="w-4 h-4 mr-2" /> {showFinalize ? 'Hide finalize' : 'Finalize pool'}
          </Button>
        </div>
      </Card>

      {showFinalize && (
        <FinalizePoolPanel season={season} onClose={() => setShowFinalize(false)} onFinalized={onSeasonsUpdate} />
      )}

      {/* Link-model rollover + backfill + one-time migration */}
      <RolloverPanel season={season} seasons={seasons || []} onSeasonsUpdate={onSeasonsUpdate} />

      {/* Nominee pool triage — scoped to this single cohort */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-editorial-navy" />
          <h3 className="font-heading text-lg text-editorial-navy">Nominee pool</h3>
          <span className="text-xs text-editorial-navy/50">Triage, approve to pool, and export per cohort.</span>
        </div>
        <NomineeManager seasons={[season]} />
      </section>

      {/* Intake triage — scoped to this cohort's track */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck className="w-4 h-4 text-editorial-navy" />
          <h3 className="font-heading text-lg text-editorial-navy">Nomination intake</h3>
          <span className="text-xs text-editorial-navy/50">Track: {season.cohort_label || season.cohort_key || 'this cohort'}</span>
        </div>
        <NominationIntakeManager lockedSeason={season} />
      </section>
    </div>
  );
}