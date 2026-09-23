import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ArchiveRestore, Loader2, CheckCircle2 } from 'lucide-react';
import StepPanel from './StepPanel';
import { callPool, downloadJson } from './poolApi';

export default function PreflightStep({ season, log, setLog }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [migration, setMigration] = useState(null);

  const backup = async () => {
    setBusy('backup'); setError('');
    try {
      const data = await callPool('backup', { season_id: season.id });
      const stamp = data.generated_at.replace(/[:.]/g, '-');
      downloadJson(data, `top100_nominations_backup_${season.name.replace(/[^a-zA-Z0-9]/g, '_')}_${stamp}.json`);
      setLog((l) => ({ ...l, backup_downloaded_at: data.generated_at, backup_counts: data.counts }));
    } catch (e) { setError(e.message); }
    setBusy('');
  };

  const migrate = async () => {
    setBusy('migrate'); setError('');
    try { setMigration(await callPool('migrate_legacy')); } catch (e) { setError(e.message); }
    setBusy('');
  };

  return (
    <StepPanel title="Pre-flight" lede="Download a complete restore point before anything in the pool changes, then fold the retired legacy nominations into the intake record.">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-editorial-navy/10 p-5">
          <p className="text-xs uppercase tracking-widest text-editorial-copper font-bold">Required</p>
          <p className="font-heading text-lg text-editorial-navy mt-1">Download all nominations</p>
          <p className="text-sm text-editorial-navy/60 mt-1">Every intake record, every legacy nomination, and this season's full nominee records as one JSON file.</p>
          <Button onClick={backup} disabled={!!busy} className="mt-4 bg-editorial-copper hover:bg-editorial-copper/90 text-white gap-2">
            {busy === 'backup' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download backup
          </Button>
          {log.backup_downloaded_at && (
            <p className="mt-3 text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved {new Date(log.backup_downloaded_at).toLocaleString()} · {log.backup_counts?.nomination_intake} intake · {log.backup_counts?.legacy_nominations} legacy · {log.backup_counts?.season_nominees} nominees
            </p>
          )}
        </div>
        <div className="rounded-xl border border-editorial-navy/10 p-5">
          <p className="text-xs uppercase tracking-widest text-editorial-gold font-bold">Recommended</p>
          <p className="font-heading text-lg text-editorial-navy mt-1">Retire legacy nominations</p>
          <p className="text-sm text-editorial-navy/60 mt-1">Copies legacy records into the intake hub with a migration flag. Safe to run twice; duplicates are skipped.</p>
          <Button onClick={migrate} disabled={!!busy || !log.backup_downloaded_at} variant="outline" className="mt-4 gap-2 border-editorial-navy/30 text-editorial-navy">
            {busy === 'migrate' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArchiveRestore className="w-4 h-4" />} Migrate legacy records
          </Button>
          {migration && <p className="mt-3 text-xs text-emerald-700">{migration.migrated} migrated · {migration.skipped} already present · {migration.total} total</p>}
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
    </StepPanel>
  );
}