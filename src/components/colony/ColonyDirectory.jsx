import { X, ArrowRight } from 'lucide-react';
import { COLONY_ROOMS } from '@/components/colony/colonyZones';

// The campus directory: every virtual room, one tap away.
export default function ColonyDirectory({ current, onGo, onClose }) {
  const rooms = Object.entries(COLONY_ROOMS);
  return (
    <div className="absolute inset-3 z-30 mx-auto flex max-w-sm flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 shadow-xl">
      <div className="flex items-center justify-between border-b border-editorial-copper/50 px-4 py-3">
        <p className="font-heading text-lg text-editorial-cream">Campus Directory</p>
        <button type="button" onClick={onClose} aria-label="Close directory" className="text-editorial-cream/70"><X className="h-4 w-4" /></button>
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {rooms.map(([key, r]) => (
          <li key={key}>
            <button type="button" disabled={key === current} onClick={() => onGo(key)}
              className="flex w-full items-center justify-between rounded px-3 py-2.5 text-left text-sm text-editorial-cream hover:bg-white/5 disabled:opacity-50">
              <span>{r.label}{key === current && <span className="ml-2 text-[10px] uppercase tracking-widest text-editorial-gold">You are here</span>}</span>
              {key !== current && <ArrowRight className="h-4 w-4 text-editorial-gold" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}