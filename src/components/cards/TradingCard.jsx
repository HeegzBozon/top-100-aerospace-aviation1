import StarCardFace from './StarCardFace';
import CardBack from './CardBack';

// ONE CARD, TURNED
//
// The face and the reverse are one object, so they turn as one: the same plate, the same
// size, the same hairline — only what is printed on them changes. Nothing here is a
// container of its own; a card is drawn wherever a record is held.
export default function TradingCard({ card, litAt, side = 'front', compact = false, className = '' }) {
  if (!card) return null;
  const turned = side === 'back';
  return (
    <div className={`relative ${className}`} style={{ perspective: '1200px' }}>
      <div
        className="relative transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: turned ? 'rotateY(180deg)' : 'none' }}
      >
        <div style={{ backfaceVisibility: 'hidden' }}>
          <StarCardFace card={card} litAt={litAt} compact={compact} />
        </div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <CardBack card={card} />
        </div>
      </div>
    </div>
  );
}