import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RefreshCw, ArchiveRestore, Database, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Link-model rollover + backfill + one-time migration actions for a cohort.
// Rollover now  -> rolloverNominees({ target_season_id, default sources = all prior same-cohort })
// Backfill      -> rolloverNominees({ target_season_id, source_season_ids }) one-time men 2026 style
// Migrate       -> migrateNomineeSeasons (one-time platform task; seeds season_ids/season_scores)
export default function RolloverPanel({ season, seasons = [], onSeasonsUpdate }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);

  // Prior same-cohort seasons (for the default rollover preview / backfill source list).
  const priorSameCohort = (seasons || [])
    .filter((s) => s.id !== season?.id && !s.is_group && s.cohort_key === season?.cohort_key);

  const run = async (fn, label, payload) => {
    setBusy(fn);
    setResult(null);
    try {
      const res = await base44.functions.invoke(fn, payload);
      setResult({ label, ok: true, data: res.data ?? res });
      toast({ title: `${label} complete`, description: 'See the receipt in the panel.' });
      onSeasonsUpdate?.();
    } catch (err) {
      setResult({ label, ok: false, error: err?.message || 'Failed' });
      toast({ variant: 'destructive', title: `${label} failed`, description: err?.message || 'See the panel for details.' });
    } finally {
      setBusy(null);
    }
  };

  const receiptLine = (r) => {
    if (!r) return null;
    if (!r.ok) {
      return (
        <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{r.label}: {r.error}</span>
        </div>
      );
    }
    const d = r.data || {};
    const stats = [
      d.linked != null && `linked ${d.linked}`,
      d.returning_honorees != null && `${d.returning_honorees} returning`,
      d.merged_target_duplicates != null && `${d.merged_target_duplicates} merged`,
      d.skipped_already_member != null && `${d.skipped_already_member} already in`,
    ].filter(Boolean);
    return (
      <div className="mt-3 flex items-start gap-2 text-xs text-editorial-navy bg-editorial-cream/60 border border-editorial-copper/20 rounded-md p-3">
        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-editorial-copper" />
        <span><strong>{r.label}:</strong> {stats.join(' · ') || 'done'}</span>
      </div>
    );
  };

  return (
    <Card className="p-5 border-editorial-navy/15 bg-white">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-editorial-navy/5 border border-editorial-navy/10">
          <RefreshCw className="w-4 h-4 text-editorial-copper" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-editorial-copper font-bold">Rollover &amp; backfill</p>
          <h3 className="font-heading text-lg text-editorial-navy leading-tight">Carry nominees forward</h3>
        </div>
      </div>
      <p className="text-xs text-editorial-navy/60 mb-3 max-w-xl">
        Link-model: each prior nominee is linked into this cohort without copying. Deduped by LinkedIn slug then email.
        {priorSameCohort.length > 0
          ? ` ${priorSameCohort.length} prior ${season?.cohort_label || season?.cohort_key || 'cohort'} season(s) available to roll.`
          : ' No prior same-cohort seasons found yet.'}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!season?.id || busy === 'rolloverNominees'}
          onClick={() => run('rolloverNominees', 'Rollover now', { target_season_id: season?.id })}
          className="border-editorial-copper/40 text-editorial-navy"
        >
          {busy === 'rolloverNominees' ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
          Rollover now
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!season?.id || busy === 'rolloverNominees' || priorSameCohort.length === 0}
          onClick={() =>
            run('rolloverNominees', 'Backfill from archives', {
              target_season_id: season?.id,
              source_season_ids: priorSameCohort.map((s) => s.id),
            })
          }
          className="border-editorial-navy/30 text-editorial-navy"
        >
          {busy === 'rolloverNominees' ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ArchiveRestore className="w-3.5 h-3.5 mr-1.5" />}
          Backfill from archives
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={busy === 'migrateNomineeSeasons'}
          onClick={() => run('migrateNomineeSeasons', 'Migrate to link model', { action: 'migrate' })}
          className="text-editorial-navy/70"
        >
          {busy === 'migrateNomineeSeasons' ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Database className="w-3.5 h-3.5 mr-1.5" />}
          Migrate to link model
        </Button>
      </div>
      {receiptLine(result)}
    </Card>
  );
}