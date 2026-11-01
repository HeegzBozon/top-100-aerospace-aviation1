import { Mic2, Lock } from 'lucide-react';

// Where you are standing, as far as sound goes: the room (and its copy when it overflowed),
// and whether you're on a stage or at a private table.
export default function ColonyAreaChip({ roomLabel, copy, area }) {
  if (copy <= 1 && !area) return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-editorial-copper/60 bg-editorial-navy/90 px-3 py-1 font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-editorial-cream">
      {copy > 1 && <span>{roomLabel} · {copy}</span>}
      {copy > 1 && area && <span className="text-editorial-gold">/</span>}
      {area?.kind === 'stage' && <><Mic2 className="h-3 w-3 text-editorial-gold" /> On stage · whole room hears you</>}
      {area?.kind === 'table' && <><Lock className="h-3 w-3 text-editorial-gold" /> {area.label} · private</>}
    </div>
  );
}