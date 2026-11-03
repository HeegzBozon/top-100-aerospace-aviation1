import { Play, Trophy } from 'lucide-react';

const format = (n) => (n ? n.toLocaleString() : '—');

// One machine, read the way a cabinet is read from the floor: the marquee across the
// top, the mechanism printed under the house name, and the record it is holding.
export default function ArcadeCabinet({ cabinet, record, onPlay }) {
  return (
    <button
      type="button"
      onClick={() => onPlay(cabinet.id)}
      className="arcade-plate group flex w-full flex-col overflow-hidden text-left transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper"
    >
      <span className="arcade-marquee relative block px-4 py-3">
        <span className="relative z-10 block font-heading text-xl leading-none text-editorial-cream">{cabinet.label}</span>
        <span className="relative z-10 mt-1 block text-[10px] uppercase tracking-[0.22em] text-editorial-cream/60">
          {cabinet.mechanism}
        </span>
      </span>

      <span className="flex flex-1 flex-col gap-3 px-4 py-4">
        <span className="block text-sm leading-relaxed text-editorial-cream/70">{cabinet.blurb}</span>
        <span className="mt-auto flex items-center justify-between pt-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-editorial-cream/50">
            <Trophy className="h-3 w-3" style={{ color: cabinet.accent }} />
            Record
            <span className="font-heading text-sm normal-case tracking-normal text-editorial-cream">
              {format(record)}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded border border-editorial-copper/60 bg-editorial-copper/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-editorial-cream transition-colors group-hover:bg-editorial-copper/30">
            <Play className="h-3 w-3" />
            Play
          </span>
        </span>
      </span>
    </button>
  );
}