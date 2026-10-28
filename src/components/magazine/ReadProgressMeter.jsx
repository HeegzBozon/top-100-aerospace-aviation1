import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// How much of the issue has been read — the whole book, not the page standing open.
//
// It sits in the head band beside the title, seated in a dark plate so the measure reads
// as an instrument rather than a hint: the track runs the width of a printed line, the
// metal fills it copper into rose gold, and the figure is set in the issue's own serif.
// The measure is the reader's own place, kept on the machine they read on, and it is never
// read by anything that measures Fellows or issues.
export default function ReadProgressMeter({ percent = 0 }) {
  const read = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <span
      className="hidden items-center gap-2.5 rounded-full py-1 pl-3 pr-2.5 sm:flex"
      style={{
        background: 'linear-gradient(180deg, rgba(9,19,36,0.92), rgba(6,13,26,0.92))',
        border: '1px solid rgba(201,168,124,0.30)',
        boxShadow: 'inset 0 1px 0 rgba(250,248,245,0.07), 0 2px 8px -4px rgba(3,6,13,0.8)',
      }}
      aria-label={`${read}% of the issue read`}
    >
      <span
        className="text-[8px] font-bold uppercase tracking-[0.26em]"
        style={{ color: 'rgba(201,168,124,0.78)' }}
      >
        Read
      </span>

      <span
        className="relative block h-[7px] w-28 overflow-hidden rounded-full lg:w-44"
        style={{
          background: 'rgba(250,248,245,0.09)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.55), inset 0 -1px 0 rgba(250,248,245,0.05)',
        }}
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-0 left-0 overflow-hidden rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${read}%`,
            background: `linear-gradient(90deg, ${P.copper} 0%, ${P.gold} 58%, #F6E4BE 100%)`,
            boxShadow: '0 0 12px rgba(201,168,124,0.75), inset 0 1px 0 rgba(255,255,255,0.55)',
          }}
        >
          <span className="rpm-sheen absolute inset-0" />
        </span>
      </span>

      <span
        className="min-w-[2.4rem] text-right font-heading text-[14px] leading-none tabular-nums"
        style={{ color: '#F6E4BE', textShadow: '0 0 10px rgba(201,168,124,0.45)' }}
      >
        {read}
        <span className="ml-px text-[9px] font-body" style={{ color: 'rgba(201,168,124,0.8)' }}>%</span>
      </span>
    </span>
  );
}