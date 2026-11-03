import { useState } from 'react';
import { ChevronLeft, RotateCw } from 'lucide-react';
import TradingCard from './TradingCard';

// ONE HELD CARD, READ
//
// A card in the drawer is a thumbnail; this is the same card at the size it is meant to
// be read, front and back. The turn is a key, not an animation on a timer.
export default function CardStudy({ card, litAt, onClose }) {
  const [side, setSide] = useState('front');

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-editorial-cream/60 hover:text-editorial-cream"
        >
          <ChevronLeft className="h-3 w-3" /> The collection
        </button>
        <button
          type="button"
          onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
          aria-pressed={side === 'back'}
          className="flex items-center gap-1.5 rounded border border-editorial-copper/60 px-2 py-1 text-[9px] uppercase tracking-[0.14em] text-editorial-cream/85 hover:border-editorial-gold"
        >
          <RotateCw className="h-3 w-3" /> {side === 'front' ? 'Turn over' : 'Face'}
        </button>
      </div>

      <div className="mx-auto mt-3 w-full max-w-[270px]">
        <TradingCard card={card} litAt={litAt} side={side} />
      </div>

      <p className="mx-auto mt-3 max-w-xs text-center text-[10px] leading-relaxed text-editorial-cream/45">
        A card is a record held, not a standing. Nothing on either side carries weight in nomination,
        measurement or influence tiers.
      </p>
    </div>
  );
}