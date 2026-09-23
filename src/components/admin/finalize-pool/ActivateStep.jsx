import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import StepPanel from './StepPanel';
import { callPool } from './poolApi';

function Check({ ok, label }) {
  const Icon = ok ? CheckCircle2 : AlertTriangle;
  return <li className={`flex items-center gap-2 text-sm ${ok ? 'text-emerald-700' : 'text-amber-700'}`}><Icon className="w-4 h-4" /> {label}</li>;
}

export default function ActivateStep({ season, log, onActivated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dupOk = !log.open_duplicates || log.ack_duplicates;
  const orphOk = !log.open_orphans || log.carry_orphans || log.ack_orphans;
  const ready = !!log.backup_downloaded_at && dupOk && orphOk;

  const activate = async () => {
    if (!window.confirm(`Activate the voting pool for ${season.name}? Every approved record moves to active.`)) return;
    setBusy(true); setError('');
    try {
      const { receipt } = await callPool('activate', {
        season_id: season.id,
        ack_duplicates: log.ack_duplicates,
        ack_orphans: log.ack_orphans,
        carry_orphans: log.carry_orphans,
        merges_performed: log.merges_performed,
        orphans_resolved: log.orphans_resolved,
        backup_downloaded_at: log.backup_downloaded_at,
      });
      onActivated(receipt);
    } catch (e) { setError(e.message); }
    setBusy(false);
  };

  return (
    <StepPanel title="Activate Pool" lede="Moves this season's approved records into the active voting pool and records a finalization receipt on the season.">
      <ul className="space-y-2">
        <Check ok={!!log.backup_downloaded_at} label="Restore point downloaded" />
        <Check ok={dupOk} label={log.open_duplicates ? `${log.open_duplicates} duplicate group(s) acknowledged` : 'No open duplicates'} />
        <Check ok={orphOk} label={!log.open_orphans ? 'No open orphans' : log.carry_orphans ? `${log.open_orphans} orphaned record(s) will carry into the pool` : `${log.open_orphans} orphaned record(s) left out`} />
      </ul>
      <p className="text-xs text-editorial-navy/50 mt-4">{log.merges_performed} merge(s) performed · {log.orphans_resolved} orphan(s) linked this session</p>
      <Button onClick={activate} disabled={!ready || busy} className="mt-6 bg-editorial-copper hover:bg-editorial-copper/90 text-white gap-2">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />} Activate voting pool
      </Button>
      {!ready && <p className="text-xs text-amber-700 mt-2">Resolve or acknowledge the items above to enable activation.</p>}
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
    </StepPanel>
  );
}