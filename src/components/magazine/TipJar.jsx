import { Coffee } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import MagazineLink from '@/components/magazine/MagazineLink';

// The founder's tip jar, printed on the closing plate.
//
// A back cover ends the issue, and the last thing it can offer a reader who has just read
// the whole thing is a way to say thank you. It is an address, not a checkout: the key
// hands the reader to Venmo in a new tab, so the issue stays open behind them, and no
// payment detail ever touches the paper.
export const TIP_JAR_URL = 'https://venmo.com/u/pineappleempire';
export const TIP_JAR_HANDLE = '@pineappleempire';

export default function TipJar({ className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <MagazineLink
        href={TIP_JAR_URL}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background: P.cream,
          color: P.navy,
          outlineColor: P.gold,
          boxShadow: '0 10px 26px rgba(7,15,31,0.38)',
        }}
      >
        <Coffee className="h-3.5 w-3.5" style={{ color: P.copper }} aria-hidden="true" />
        Buy the founder a coffee
      </MagazineLink>
      <p
        className="text-[9px] font-bold uppercase tracking-[0.28em]"
        style={{ color: 'rgba(250,248,245,0.66)', textShadow: '0 1px 6px rgba(7,15,31,0.7)' }}
      >
        Venmo · {TIP_JAR_HANDLE}
      </p>
    </div>
  );
}