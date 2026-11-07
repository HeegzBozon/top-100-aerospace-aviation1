import { useState } from 'react';
import { Route } from 'lucide-react';
import { JOURNEYS } from './journeyMap';
import JourneyCard from './JourneyCard';
import VoteWalkthrough from '@/components/voting/VoteWalkthrough';

// THE JOURNEY DESK — the top of Mission Control, read as a map rather than a tally.
//
// One road is walked today: the analyst invited to serve, from the sealed envelope to their
// first Crosscheck. The rest are mapped as suggestions, so the house can agree on the shape
// of a road before anyone builds it. Nothing here changes a record.

const RUNNABLE = { analyst: true };

export default function JourneyMapping({ currentUser }) {
  const [running, setRunning] = useState(null);
  const canRun = currentUser?.role === 'admin';

  const mapped = JOURNEYS.filter((journey) => journey.status === 'mapped');
  const suggested = JOURNEYS.filter((journey) => journey.status === 'suggested');

  if (running) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-editorial-cream">
        <VoteWalkthrough user={currentUser} onClose={() => setRunning(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="desk-plate p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-md border border-editorial-gold/35 bg-editorial-gold/10">
              <Route className="h-5 w-5 text-editorial-gold" aria-hidden="true" />
            </div>
            <div>
              <p className="font-body text-[10px] font-semibold uppercase tracking-[0.28em] text-editorial-gold">
                Journey Mapping
              </p>
              <h2 className="mt-1 font-heading text-2xl text-editorial-cream">Every door into the house</h2>
              <p className="mt-1.5 max-w-2xl font-body text-xs leading-6 text-editorial-cream/65">
                The road a person travels from the door they arrive at to the record they leave
                behind. One road is walked and watched; the rest are mapped as suggestions,
                naming the actor and the canonical surfaces before anything is built.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="desk-face px-4 py-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">Journeys mapped</p>
            <p className="mt-1 font-heading text-3xl text-editorial-navy">{JOURNEYS.length}</p>
            <p className="mt-1 font-body text-[10px] text-editorial-navy/60">Across every road in</p>
          </div>
          <div className="desk-face px-4 py-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">Walkable now</p>
            <p className="mt-1 font-heading text-3xl text-editorial-navy">{mapped.length}</p>
            <p className="mt-1 font-body text-[10px] text-editorial-navy/60">Read-only preview</p>
          </div>
          <div className="desk-face px-4 py-4">
            <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">Suggested</p>
            <p className="mt-1 font-heading text-3xl text-editorial-navy">{suggested.length}</p>
            <p className="mt-1 font-body text-[10px] text-editorial-navy/60">Drawn, not yet built</p>
          </div>
        </div>
      </div>

      <section>
        <p className="mb-3 font-body text-[10px] font-bold uppercase tracking-[0.24em] text-editorial-gold/80">
          Walked today
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {mapped.map((journey) => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              onRun={canRun && RUNNABLE[journey.id] ? () => setRunning(journey.id) : null}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 font-body text-[10px] font-bold uppercase tracking-[0.24em] text-editorial-gold/80">
          Suggested journeys
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {suggested.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      </section>
    </div>
  );
}