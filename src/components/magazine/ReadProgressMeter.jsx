import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// How much of the issue has been read — the whole book, not the page standing open.
//
// It sits in the head band, beside the title, so the rule across the foot of the picture
// can mean one thing only: the page. The measure is the reader's own place, kept on the
// machine they read on, and it is never read by anything that measures Fellows or issues.
export default function ReadProgressMeter({ percent = 0 }) {
  return (
    <span className="hidden items-center gap-2 sm:flex" aria-label={`${percent}% of the issue read`}>
      <span
        className="text-[9px] font-bold uppercase tracking-[0.24em]"
        style={{ color: 'rgba(250,248,245,0.45)' }}
      >
        Read
      </span>
      <span
        className="relative block h-[3px] w-14 overflow-hidden rounded-full"
        style={{ background: 'rgba(250,248,245,0.14)' }}
        aria-hidden="true"
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${percent}%`,
            background: `linear-gradient(90deg, ${P.copper}, ${P.gold})`,
            boxShadow: '0 0 8px rgba(201,168,124,0.5)',
          }}
        />
      </span>
      <span className="text-[9px] font-bold tabular-nums" style={{ color: P.gold }}>
        {percent}%
      </span>
    </span>
  );
}