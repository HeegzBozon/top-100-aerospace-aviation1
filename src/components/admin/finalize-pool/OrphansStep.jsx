import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link2, Loader2, FileCheck2 } from 'lucide-react';
import StepPanel, { CleanState, AckBox } from './StepPanel';
import { callPool, linkToPool } from './poolApi';

export default function OrphansStep({ season, log, setLog }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [linkingId, setLinkingId] = useState(null);

  useEffect(() => {
    setData(null); setError('');
    callPool('orphans', { season_id: season.id }).then(setData).catch((e) => setError(e.message));
  }, [season.id]);

  const open = data ? data.unlinked_intakes.length + data.unbacked_nominees.length : 0;
  useEffect(() => { if (data) setLog((l) => ({ ...l, open_orphans: open })); }, [data, open, setLog]);

  const link = async (intake) => {
    setLinkingId(intake.id);
    try {
      await linkToPool({ mode: 'intake', intake_id: intake.id, season_id: season.id });
      setData((d) => ({ ...d, unlinked_intakes: d.unlinked_intakes.filter((i) => i.id !== intake.id) }));
      setLog((l) => ({ ...l, orphans_resolved: l.orphans_resolved + 1 }));
    } catch (e) { setError(e.message); }
    setLinkingId(null);
  };

  return (
    <StepPanel title="Orphaned Nominations" lede="Approved nominations with no pool record, and pool records in this season with no nomination behind them." loading={!data && !error} error={error}>
      {data && (open === 0 ? (
        <CleanState icon={FileCheck2} title="Every nomination is accounted for" body="All approved nominations are linked, and every pending or approved record has provenance." />
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-editorial-copper mb-2">Approved but unlinked · {data.unlinked_intakes.length}</p>
            {data.unlinked_intakes.length === 0 ? <p className="text-sm text-editorial-navy/50">None.</p> : data.unlinked_intakes.map((i) => (
              <div key={i.id} className="flex items-center justify-between gap-3 py-2 border-b border-editorial-navy/5 text-sm">
                <span><span className="font-medium text-editorial-navy">{i.nominee_name}</span> <span className="text-editorial-navy/50">· {i.nomination_type} · by {i.nominator_email}</span></span>
                <Button size="sm" variant="outline" disabled={linkingId === i.id} onClick={() => link(i)} className="gap-2">
                  {linkingId === i.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />} Link to pool
                </Button>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-editorial-copper mb-2">Records without a linked nomination · {data.unbacked_nominees.length}</p>
            <p className="text-xs text-editorial-navy/50 mb-2">Typically imported or rolled-over records. Pending records stay out of the voting pool regardless.</p>
            <div className="max-h-64 overflow-y-auto divide-y divide-editorial-navy/5">
              {data.unbacked_nominees.map((n) => (
                <div key={n.id} className="py-1.5 text-sm flex gap-3"><span className="text-editorial-navy">{n.name}</span><span className="text-editorial-navy/40 capitalize">{n.status}</span></div>
              ))}
            </div>
          </div>
          <AckBox
            checked={log.carry_orphans}
            onChange={(v) => setLog((l) => ({ ...l, carry_orphans: v }))}
            label={`Carry all ${open} record(s) into this season's voting pool on activation. Unlinked nominations are linked first (recommended for 2026).`}
          />
          {!log.carry_orphans && (
            <AckBox checked={log.ack_orphans} onChange={(v) => setLog((l) => ({ ...l, ack_orphans: v }))} label={`Leave these ${open} record(s) out of the voting pool.`} />
          )}
        </div>
      ))}
    </StepPanel>
  );
}