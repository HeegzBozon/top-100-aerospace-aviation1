import { ArrowRight } from 'lucide-react';

// A slim banner for the door the player is standing at. Enter, the wheel's centre or A opens it.
// It sits clear of the call controls at the foot of the glass, and over them: a press on the
// door is never swallowed by the row of buttons underneath.
export default function ColonyZoneCard({ zone, onActivate }) {
  if (!zone) return null;
  const verb = zone.room === 'hall' && zone.key !== 'enter-campus' ? 'Exit' : zone.panel ? 'Open' : 'Enter';
  return (
    <button
      type="button"
      onClick={() => onActivate(zone)}
      className="absolute left-3 right-3 z-[60] mx-auto flex max-w-md items-center gap-2 rounded-full border border-editorial-copper/60 bg-editorial-navy/95 px-3 py-1.5 text-left shadow-lg"
      style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
    >
      <span className="min-w-0 flex-1 truncate font-heading text-sm text-editorial-cream">{zone.label}</span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-editorial-copper px-2.5 py-0.5 text-[11px] font-semibold text-editorial-cream">
        {verb} <ArrowRight className="h-3 w-3" />
      </span>
    </button>
  );
}