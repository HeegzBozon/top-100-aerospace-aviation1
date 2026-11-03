import { X } from 'lucide-react';
import MissionTheatre from '@/components/theatre/MissionTheatre';

// The Mission Theatre, stood inside the Space Pavilion: the same theatre the house runs
// on its own page, seated in the room's wall plate so a visitor never leaves the campus.
export default function ColonyTheatrePanel({ onClose }) {
  return (
    <div className="absolute inset-2 z-30 mx-auto flex max-w-4xl flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-[#08131f] shadow-2xl">
      <div className="flex items-center justify-between border-b border-editorial-copper/40 px-4 py-2.5">
        <p className="font-heading text-lg text-editorial-cream">Mission Theatre</p>
        <button type="button" onClick={onClose} aria-label="Close the Mission Theatre" className="text-editorial-cream/80 hover:text-editorial-cream">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MissionTheatre variant="panel" />
      </div>
    </div>
  );
}