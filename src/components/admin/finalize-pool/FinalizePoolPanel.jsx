import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import StepIndicator from './StepIndicator';
import PreflightStep from './PreflightStep';
import DedupScanStep from './DedupScanStep';
import OrphansStep from './OrphansStep';
import ActivateStep from './ActivateStep';
import ReceiptStep from './ReceiptStep';

const STEPS = [
  { key: 'preflight', label: 'Pre-flight' },
  { key: 'dedup', label: 'Dedup Scan' },
  { key: 'orphans', label: 'Orphans' },
  { key: 'activate', label: 'Activate' },
  { key: 'receipt', label: 'Receipt' },
];
const FRESH_LOG = { backup_downloaded_at: null, backup_counts: null, merges_performed: 0, orphans_resolved: 0, open_duplicates: 0, open_orphans: 0, ack_duplicates: false, ack_orphans: false, carry_orphans: true };

// Finalize Pool as a lifecycle phase for a single cohort, embedded in Season Manager.
export default function FinalizePoolPanel({ season, onClose, onFinalized }) {
  const [step, setStep] = useState(0);
  const [log, setLog] = useState(FRESH_LOG);
  const [receipt, setReceipt] = useState(null);
  const canNext = step === 0 ? !!log.backup_downloaded_at : step < 3;

  const activated = (r) => { setReceipt(r); setStep(4); onFinalized?.(); };

  return (
    <section className="rounded-2xl border border-editorial-navy/15 bg-white overflow-hidden">
      <div className="bg-editorial-navy text-white px-6 py-5 border-b-2 border-editorial-copper flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-gold font-bold">Lifecycle phase · Finalize the pool</p>
          <h3 className="font-heading text-2xl mt-1">{season.cohort_label || season.name}</h3>
          {season.pool_finalized_at && <p className="text-xs text-editorial-gold mt-1">Previously finalized {new Date(season.pool_finalized_at).toLocaleString()}</p>}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10"><X className="w-5 h-5" /></Button>
      </div>
      <div className="p-6">
        <StepIndicator steps={STEPS} current={step} />
        <div className="mt-6">
          {step === 0 && <PreflightStep season={season} log={log} setLog={setLog} />}
          {step === 1 && <DedupScanStep season={season} log={log} setLog={setLog} />}
          {step === 2 && <OrphansStep season={season} log={log} setLog={setLog} />}
          {step === 3 && <ActivateStep season={season} log={log} onActivated={activated} />}
          {step === 4 && receipt && <ReceiptStep season={season} receipt={receipt} />}
        </div>
        {step < 4 && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
            {step < 3 && (
              <Button disabled={!canNext} onClick={() => setStep(step + 1)} className="gap-2 bg-editorial-copper hover:bg-editorial-copper/90 text-white">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}