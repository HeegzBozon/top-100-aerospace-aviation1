import { Coffee } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import MagazineLink from '@/components/magazine/MagazineLink';

// The founder's tip jar, printed as the closing address of the issue.
//
// A back cover ends the edition, and the last thing it can offer a reader who has just
// read the whole thing is a way to say thank you. It is an address, not a checkout: the
// key hands the reader to Venmo in a new tab, so the issue stays open behind them, and no
// payment detail ever touches the paper.
//
// It is set at the foot of the plate in the house's own voice — a rose gold kicker, one
// line of italic serif, the dual-metal rule, then the key in copper, which is the metal
// this platform spends on the one thing it wants pressed. Composed at the page's design
// size (400 × 560), so the scale of the spread carries it.
export const TIP_JAR_URL = 'https://venmo.com/u/pineappleempire';
export const TIP_JAR_HANDLE = '@pineappleempire';

export default function TipJar({ className = '' }) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span
        className="text-[8px] font-bold uppercase tracking-[0.34em]"
        style={{ color: P.gold, textShadow: '0 1px 8px rgba(7,15,31,0.8)' }}
      >
        From the founder
      </span>

      <span
        className="mt-2.5 max-w-[230px] font-serif italic leading-[1.35]"
        style={{ fontSize: 15, color: P.cream, textShadow: '0 1px 12px rgba(7,15,31,0.85)' }}
      >
        One coffee keeps the next issue flying.
      </span>

      {/* The dual-metal rule: rose gold over copper, the way the house closes an edition. */}
      <span
        className="mt-3 h-px w-9"
        style={{ background: `linear-gradient(90deg, transparent, ${P.gold}, transparent)` }}
      />

      <MagazineLink
        href={TIP_JAR_URL}
        className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-[7px] text-[9px] font-bold uppercase tracking-[0.2em] transition-transform duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: `linear-gradient(180deg, #C88341 0%, ${P.copper} 52%, #9C5F28 100%)`,
          color: P.cream,
          outlineColor: P.gold,
          boxShadow:
            '0 0 0 1px rgba(201,168,124,0.5), 0 10px 22px rgba(7,15,31,0.45), inset 0 1px 0 rgba(255,255,255,0.24)',
        }}
      >
        <Coffee className="h-3 w-3" aria-hidden="true" />
        Buy the founder a coffee
      </MagazineLink>

      <span
        className="mt-2 text-[8px] font-semibold uppercase tracking-[0.26em]"
        style={{ color: 'rgba(250,248,245,0.55)' }}
      >
        Venmo · {TIP_JAR_HANDLE}
      </span>
    </div>
  );
}