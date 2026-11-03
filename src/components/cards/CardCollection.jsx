import { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { loadStars } from '@/components/star-atlas/starAtlas';
import { cardsFrom } from './cardModel';
import StarCardFace from './StarCardFace';
import CardStudy from './CardStudy';

// THE COLLECTION
//
// The stars a visitor has lit, kept as cards. This is the seed of the trading layer: a lit
// star is already a record read — the card is that record held. Nothing here is traded,
// valued or counted against anyone; a card carries no standing, and the collection says so.
export default function CardCollection({ passport, onGo }) {
  const ids = Object.keys(passport?.stars || {});
  const [cards, setCards] = useState(null);
  const [failed, setFailed] = useState(false);
  const [openId, setOpenId] = useState(null);
  const key = ids.join(',');

  useEffect(() => {
    let live = true;
    setFailed(false);
    if (!ids.length) { setCards([]); return undefined; }
    loadStars(ids)
      .then((rows) => {
        if (!live) return;
        // Kept in the order the stars were lit, not the order the records came back.
        const byId = Object.fromEntries(cardsFrom(rows).map((c) => [c.id, c]));
        setCards(ids.map((id) => byId[id]).filter(Boolean));
      })
      .catch(() => { if (live) { setCards([]); setFailed(true); } });
    return () => { live = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cards) {
    return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-editorial-gold" /></div>;
  }

  if (failed) {
    return (
      <div className="py-10 text-center">
        <p className="font-heading text-editorial-cream">The drawer would not open.</p>
        <p className="mt-1 text-xs text-editorial-cream/60">Your cards are recorded — the record could not be read just now. Turn back and open the collection again.</p>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="py-10 text-center">
        <Star className="mx-auto h-7 w-7 text-editorial-gold/70" />
        <p className="mt-2 font-heading text-lg text-editorial-cream">No cards yet.</p>
        <p className="mx-auto mt-1 max-w-xs text-xs text-editorial-cream/60">
          A card is a record you have already read. Light a star in the Atlas and its card is filed here.
        </p>
        {onGo && (
          <button
            type="button"
            onClick={onGo}
            className="mt-4 rounded border border-editorial-copper/70 bg-editorial-copper/20 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-editorial-cream"
          >
            Open the Atlas
          </button>
        )}
      </div>
    );
  }

  // One card, taken out of the drawer and read at size — both sides of it.
  const opened = openId ? cards.find((c) => c.id === openId) : null;
  if (opened) {
    return <CardStudy card={opened} litAt={passport?.stars?.[opened.id]?.at} onClose={() => setOpenId(null)} />;
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="pd-label text-editorial-gold/80">Held · {cards.length}</p>
        <p className="text-[9px] uppercase tracking-[0.14em] text-editorial-cream/40">Gameplay only</p>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
        {cards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={() => setOpenId(card.id)}
            aria-label={`Open the card for ${card.name}`}
            className="rounded-md text-left transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-editorial-gold"
          >
            <StarCardFace card={card} litAt={passport?.stars?.[card.id]?.at} compact />
          </button>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-editorial-cream/45">
        Open a card to turn it over. A card is a record held, not a standing — nothing on either side
        carries weight in nomination, measurement or tiers.
      </p>
    </div>
  );
}