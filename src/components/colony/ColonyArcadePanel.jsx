import { useState } from 'react';
import { X } from 'lucide-react';
import ArcadeHall from '@/components/arcade/ArcadeHall';
import ArcadeStage from '@/components/arcade/ArcadeStage';
import { cabinetById } from '@/components/arcade/arcadeConfig';

// The Arcade, stood inside its own room: the same cabinets the house runs on the surface,
// seated in the room's plate, so a visitor never leaves the campus to play. Walking up to
// a cabinet opens that machine with the floor still behind it.
export default function ColonyArcadePanel({ initialCabinet, onClose }) {
  const [active, setActive] = useState(() => cabinetById(initialCabinet));

  return (
    <div className="absolute inset-2 z-30 mx-auto flex max-w-5xl flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-[#0b1725] shadow-2xl">
      <div className="flex items-center justify-between border-b border-editorial-copper/40 px-4 py-2.5">
        <p className="font-heading text-lg text-editorial-cream">{active ? active.label : 'The Arcade'}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close the Arcade"
          className="text-editorial-cream/80 hover:text-editorial-cream"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {active ? (
          <ArcadeStage cabinet={active} onExit={() => setActive(null)} embedded />
        ) : (
          <ArcadeHall onPlay={(id) => setActive(cabinetById(id))} embedded />
        )}
      </div>
    </div>
  );
}