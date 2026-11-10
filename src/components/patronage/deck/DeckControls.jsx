import { ChevronLeft, ChevronRight } from 'lucide-react';
import { P } from '../patronConfig';
import { DECK_SLIDES } from './deckSlides';

// The keys under the deck: where the reader is, and the two ways to move. Every one of them
// retires the autoplay — once a hand is on the deck, it is the reader's.
export default function DeckControls({ index, last, onGo }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <div className="flex items-center">
        {DECK_SLIDES.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => onGo(i)}
            aria-label={`Slide ${i + 1}: ${slide.label}`}
            aria-current={i === index}
            className="flex h-5 w-5 items-center justify-center"
          >
            <span
              className="block rounded-full"
              style={{
                width: i === index ? 7 : 5,
                height: i === index ? 7 : 5,
                background: i === index ? P.gold : 'rgba(250,248,245,0.32)',
              }}
            />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onGo(index - 1)}
          disabled={index === 0}
          aria-label="Previous slide"
          className="desk-key disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          type="button"
          onClick={() => onGo(index + 1)}
          disabled={index === last}
          aria-label="Next slide"
          className="desk-key disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}