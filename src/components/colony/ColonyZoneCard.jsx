import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// The door of the building the player is standing in.
export default function ColonyZoneCard({ zone, onEnterRoom }) {
  if (!zone) return null;
  const cls = 'inline-flex items-center gap-1.5 rounded bg-editorial-copper px-3 py-1.5 text-xs font-semibold text-editorial-cream';
  return (
    <div className="absolute left-3 right-3 top-3 z-20 mx-auto max-w-sm rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 p-3 shadow-xl md:left-4 md:right-auto">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-editorial-gold">You are at</p>
      <p className="font-heading text-lg text-editorial-cream">{zone.label}</p>
      <p className="mb-2 text-xs text-editorial-cream/70">{zone.blurb}</p>
      {zone.room ? (
        <button type="button" onClick={() => onEnterRoom(zone.room)} className={cls}>
          {zone.room === 'hall' ? 'Exit' : 'Enter'} <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : (
        <Link to={zone.to} className={cls}>Enter <ArrowRight className="h-3.5 w-3.5" /></Link>
      )}
    </div>
  );
}