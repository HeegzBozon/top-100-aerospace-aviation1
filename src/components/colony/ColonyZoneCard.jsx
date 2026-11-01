import { ArrowRight } from 'lucide-react';

// The door of the building the player is standing in. Enter (or the wheel's centre) opens it too.
export default function ColonyZoneCard({ zone, onActivate }) {
  if (!zone) return null;
  return (
    <div className="absolute left-3 right-3 top-3 z-20 mx-auto max-w-sm rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 p-3 shadow-xl md:left-4 md:right-auto">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-editorial-gold">You are at</p>
      <p className="font-heading text-lg text-editorial-cream">{zone.label}</p>
      <p className="mb-2 text-xs text-editorial-cream/70">{zone.blurb}</p>
      <button type="button" onClick={() => onActivate(zone)} className="inline-flex items-center gap-1.5 rounded bg-editorial-copper px-3 py-1.5 text-xs font-semibold text-editorial-cream">
        {zone.room === 'hall' && zone.key !== 'enter-campus' ? 'Exit' : zone.panel ? 'Open' : 'Enter'} <ArrowRight className="h-3.5 w-3.5" />
        <span className="ml-1 hidden text-[10px] text-editorial-cream/70 md:inline">⏎</span>
      </button>
    </div>
  );
}