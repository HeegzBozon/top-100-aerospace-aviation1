import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import CohortCard from './CohortCard';
import FinalizePoolPanel from '../finalize-pool/FinalizePoolPanel';

// Seasons not yet grouped under a parent (legacy one-list-per-season records).
export default function LooseSeasonsSection({ seasons, handlers, onNest, title }) {
  const [finalizingId, setFinalizingId] = useState(null);
  const finalizing = seasons.find((s) => s.id === finalizingId);
  if (!seasons.length) return null;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-editorial-copper/40 pb-3">
        <div>
          <h3 className="font-heading text-xl text-editorial-navy">{title}</h3>
          <p className="text-sm text-editorial-navy/60">Standalone seasons that are not part of a parent season.</p>
        </div>
        {onNest && (
          <Button size="sm" variant="outline" onClick={onNest} className="border-editorial-copper text-editorial-copper">
            <Layers className="w-4 h-4 mr-1.5" />Group into a season
          </Button>
        )}
      </div>
      {finalizing && <FinalizePoolPanel key={finalizing.id} season={finalizing} onClose={() => setFinalizingId(null)} onFinalized={handlers.onChanged} />}
      <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-4">
        {seasons.map((s) => <CohortCard key={s.id} cohort={s} handlers={handlers} onFinalize={(c) => setFinalizingId(c.id)} active={s.id === finalizingId} />)}
      </div>
    </section>
  );
}