import { ArrowRight } from 'lucide-react';

// A slim banner for the door the player is standing at. Enter, the wheel's centre or A opens it.
export default function ColonyZoneCard({ zone, onActivate }) {
  if (!zone) return null;
  const verb = zone.room === 'hall' && zone.key !== 'enter-campus' ? 'Exit' : zone.panel ? 'Open' : 'Enter';
  return (
    <button
      type="button"
      onClick={() => onActivate(zone)}
      className="absolute bottom-20 left-3 right-3 z-20 mx-auto flex max-w-md items-center gap-2 rounded-full border border-editorial-copper/60 bg-editorial-navy/90 px-3 py-1.5 text-left shadow-lg"
    >
      <span className="min-w-0 flex-1 truncate font-heading text-sm text-editorial-cream">{zone.label}</span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-editorial-copper px-2.5 py-0.5 text-[11px] font-semibold text-editorial-cream">
        {verb} <ArrowRight className="h-3 w-3" />
      </span>
    </button>
  );
}