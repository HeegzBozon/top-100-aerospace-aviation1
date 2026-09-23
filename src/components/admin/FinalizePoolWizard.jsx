import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, CalendarX } from 'lucide-react';
import StepIndicator from './finalize-pool/StepIndicator';
import PreflightStep from './finalize-pool/PreflightStep';
import DedupScanStep from './finalize-pool/DedupScanStep';
import OrphansStep from './finalize-pool/OrphansStep';
import ActivateStep from './finalize-pool/ActivateStep';
import ReceiptStep from './finalize-pool/ReceiptStep';

const STEPS = [
  { key: 'preflight', label: 'Pre-flight' },
  { key: 'dedup', label: 'Dedup Scan' },
  { key: 'orphans', label: 'Orphans' },
  { key: 'activate', label: 'Activate' },
  { key: 'receipt', label: 'Receipt' },
];
const FRESH_LOG = { backup_downloaded_at: null, backup_counts: null, merges_performed: 0, orphans_resolved: 0, open_duplicates: 0, open_orphans: 0, ack_duplicates: false, ack_orphans: false, carry_orphans: true };

export default function FinalizePoolWizard({ seasons = [] }) {
  const candidates = seasons.filter((s) => s.status !== 'archived');
  const [seasonId, setSeasonId] = useState(candidates.find((s) => s.status === 'nominations_open')?.id || candidates[0]?.id || '');
  const [step, setStep] = useState(0);
  const [log, setLog] = useState(FRESH_LOG);
  const [receipt, setReceipt] = useState(null);
  const season = seasons.find((s) => s.id === seasonId);

  const changeSeason = (id) => { setSeasonId(id); setStep(0); setLog(FRESH_LOG); setReceipt(null); };
  const canNext = step === 0 ? !!log.backup_downloaded_at : step < 3;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="rounded-2xl bg-editorial-navy text-white p-6 md:p-8 border-b-2 border-editorial-copper">
        <p className="text-xs uppercase tracking-[0.3em] text-editorial-gold font-bold">Season Ops</p>
        <h2 className="font-heading text-3xl mt-2">Finalize the Pool</h2>
        <p className="text-white/60 text-sm mt-2 max-w-2xl">A guided handoff from closed nominations to a clean, deduplicated voting pool.</p>
        <div className="mt-5 max-w-sm">
          <Select value={seasonId} onValueChange={changeSeason}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue placeholder="Select a season" /></SelectTrigger>
            <SelectContent>{candidates.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
          {season?.pool_finalized_at && <p className="text-xs text-editorial-gold mt-2">Previously finalized {new Date(season.pool_finalized_at).toLocaleString()}</p>}
        </div>
      </div>

      {!season ? (
        <div className="mt-6 rounded-2xl border border-dashed border-editorial-navy/20 py-16 text-center">
          <CalendarX className="w-9 h-9 mx-auto text-editorial-gold mb-3" />
          <p className="font-heading text-lg text-editorial-navy">No open season to finalize</p>
          <p className="text-sm text-editorial-navy/60 mt-1">Create or reopen a season in Season Manager first.</p>
        </div>
      ) : (
        <>
          <StepIndicator steps={STEPS} current={step} />
          <div className="mt-6">
            {step === 0 && <PreflightStep season={season} log={log} setLog={setLog} />}
            {step === 1 && <DedupScanStep season={season} log={log} setLog={setLog} />}
            {step === 2 && <OrphansStep season={season} log={log} setLog={setLog} />}
            {step === 3 && <ActivateStep season={season} log={log} onActivated={(r) => { setReceipt(r); setStep(4); }} />}
            {step === 4 && receipt && <ReceiptStep season={season} receipt={receipt} />}
          </div>
          {step < 4 && (
            <div className="flex justify-between mt-6">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
              {step < 3 && (
                <Button disabled={!canNext} onClick={() => setStep(step + 1)} className="gap-2 bg-editorial-navy hover:bg-editorial-navy/90 text-white">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}