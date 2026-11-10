import { useEffect, useRef, useState } from 'react';
import { P } from '../patronConfig';
import { DECK_DWELL_MS } from './deckSlides';
import useDeckTiers from './useDeckTiers';
import DeckControls from './DeckControls';
import SlideHook from './slides/SlideHook';
import SlideShift from './slides/SlideShift';
import SlideFirewall from './slides/SlideFirewall';
import SlideAudience from './slides/SlideAudience';
import SlideSlots from './slides/SlideSlots';
import SlideAsk from './slides/SlideAsk';

const SLIDES = [SlideHook, SlideShift, SlideFirewall, SlideAudience, SlideSlots, SlideAsk];
const LAST = SLIDES.length - 1;

const prefersCalm = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// THE KIT, OPENED AS A DECK.
//
// It walks itself once and then hands over: the last slide, or a hand on it, retires the
// timer for the session. Nothing is a picture of the offer — every figure and rate is read
// from the records the page prints below, so the deck cannot drift from the rate card.
export default function PatronDeck() {
  const tiers = useDeckTiers();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !prefersCalm());
  const touchStart = useRef(null);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => {
      if (index >= LAST) setPlaying(false);
      else setIndex(index + 1);
    }, DECK_DWELL_MS);
    return () => clearTimeout(timer);
  }, [index, playing]);

  const hold = () => setPlaying(false);
  const go = (next) => {
    hold();
    setIndex(Math.max(0, Math.min(LAST, next)));
  };

  const Slide = SLIDES[index];

  return (
    <section className="border-t" style={{ background: P.navyDeep, borderColor: 'rgba(201,168,124,0.3)' }}>
      <div className="mx-auto w-full max-w-5xl px-5 pb-7 pt-7 md:px-10 md:pb-8 md:pt-8">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em] md:text-[9.5px]" style={{ color: P.gold }}>
            The kit, in six slides
          </p>
          <p className="text-[9px] font-bold tracking-[0.2em] text-editorial-cream/40">
            {String(index + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
          </p>
        </div>

        <div
          className="mt-5 min-h-[258px] md:min-h-[300px]"
          onPointerDown={hold}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const travel = event.changedTouches[0].clientX - touchStart.current;
            touchStart.current = null;
            if (Math.abs(travel) > 40) go(index + (travel < 0 ? 1 : -1));
          }}
        >
          <div key={index} className="ppc-rise">
            <Slide tiers={tiers} />
          </div>
        </div>

        <div className="mt-6 h-px w-full" style={{ background: 'rgba(250,248,245,0.14)' }}>
          <div
            className="h-px"
            style={{
              width: `${((index + 1) / SLIDES.length) * 100}%`,
              background: `linear-gradient(90deg, ${P.copper}, ${P.gold})`,
              transition: 'width 420ms ease',
            }}
          />
        </div>

        <DeckControls index={index} last={LAST} onGo={go} />
      </div>
    </section>
  );
}