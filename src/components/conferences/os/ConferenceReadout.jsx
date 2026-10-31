import { Loader2, Signal } from 'lucide-react';

// The circuit, read off one instrument band: what is ahead, what is in session, and
// how many conferences this reader has declared for. It reports the same records the
// rest of the surface counts from — it is a reading, never a total kept aside.
const CELLS = [
  { key: 'ahead', label: 'Ahead' },
  { key: 'live', label: 'In session' },
  { key: 'declared', label: 'Declared' },
];

export default function ConferenceReadout({ loading, failed, counts }) {
  return (
    <div className="cfs-readout mt-4 grid grid-cols-3 overflow-hidden rounded-[6px]">
      {CELLS.map((cell, i) => (
        <div key={cell.key} className={`px-3 py-2 md:px-4 md:py-3 ${i > 0 ? 'cfs-seam' : ''}`}>
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-editorial-gold/80 md:text-[9px]">
            {cell.label}
          </p>
          <p className="mt-1 flex items-baseline gap-1.5 font-heading text-[19px] leading-none tabular-nums text-editorial-cream md:text-[24px]">
            {loading || failed ? '—' : counts[cell.key]}
            {loading && i === 0 && <Loader2 className="h-3 w-3 animate-spin text-editorial-gold/70" />}
            {failed && i === 0 && <Signal className="h-3 w-3 text-editorial-gold/70" />}
          </p>
        </div>
      ))}
    </div>
  );
}