import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import StepPanel from './StepPanel';
import { downloadJson } from './poolApi';

const ROWS = [
  ['final_pool_size', 'Final pool size'],
  ['activated_now', 'Activated now'],
  ['previously_active', 'Previously active'],
  ['still_pending', 'Still pending (not in pool)'],
  ['merges_performed', 'Merges performed'],
  ['orphans_resolved', 'Orphans resolved'],
  ['returning_honorees', 'Returning honorees'],
  ['acknowledged_duplicate_groups', 'Duplicate groups acknowledged'],
  ['acknowledged_orphans', 'Orphans acknowledged'],
];

export default function ReceiptStep({ season, receipt }) {
  return (
    <StepPanel title="Receipt" lede={`Pool finalized for ${season.name}. This receipt is stored on the season record.`}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ROWS.map(([k, label]) => (
          <div key={k} className="rounded-xl bg-editorial-cream border border-editorial-gold/30 p-4">
            <div className="font-heading text-2xl text-editorial-navy">{receipt[k] ?? 0}</div>
            <div className="text-[10px] uppercase tracking-widest text-editorial-navy/50 mt-1">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-editorial-navy/50 mt-4">
        Finalized {new Date(receipt.finalized_at).toLocaleString()} by {receipt.finalized_by}. Open voting from Season Manager when ready.
      </p>
      <Button variant="outline" className="mt-4 gap-2" onClick={() => downloadJson({ season: season.name, ...receipt }, `pool_receipt_${season.id}.json`)}>
        <Download className="w-4 h-4" /> Download receipt
      </Button>
    </StepPanel>
  );
}