import { useEffect, useMemo, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { REFLECTIONS, storyCards, dwellMs } from './starAtlas';
import AtlasPortraitCard from './AtlasPortraitCard';
import AtlasReflectCard from './AtlasReflectCard';
import useAtlasDeck from './useAtlasDeck';

// One honoree as a deck: portrait (flips), story cards paced at reading speed, then reflection.
// Autoplay advances on its own; a turn of the wheel, a key or a tap hands control back.
export default function AtlasStarCard({ nominee, lit, onLight, onBack }) {
  const story = useMemo(() => storyCards(nominee), [nominee]);
  const cards = useMemo(() => [{ kind: 'portrait' }, ...story.map(s => ({ kind: 'story', ...s })), { kind: 'reflect' }], [story]);
  const reflectAt = cards.length - 1;
  const stops = lit ? cards.length : cards.length - 1 + REFLECTIONS.length;
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [playing, setPlaying] = useState(!lit);
  const cardIdx = Math.min(index, reflectAt);
  const card = cards[cardIdx];
  const dwell = card.kind === 'story' ? dwellMs(card.text) : 4000;

  useEffect(() => {
    if (!playing || cardIdx >= reflectAt) return;
    const t = setTimeout(() => setIndex(i => i + 1), dwell);
    return () => clearTimeout(t);
  }, [playing, cardIdx, reflectAt, dwell]);

  const light = (key) => { if (!lit) onLight(key); };
  const labels = Array.from({ length: stops }, (_, i) => i < reflectAt ? (cards[i].label || nominee.name) : lit ? 'Lit' : REFLECTIONS[i - reflectAt].label);
  useAtlasDeck({
    count: stops, index, setIndex: (i) => { setIndex(i); setFlipped(false); }, labels, onBack, onUser: () => setPlaying(false),
    onEnter: () => {
      if (card.kind === 'portrait') { setFlipped(f => !f); return true; }
      if (index >= reflectAt && !lit) { light(REFLECTIONS[index - reflectAt].key); return true; }
      return false;
    },
  });
  const tap = (e) => {
    setPlaying(false);
    const r = e.currentTarget.getBoundingClientRect();
    const d = e.clientX - r.left < r.width / 3 ? -1 : 1;
    setIndex(i => Math.max(0, Math.min(stops - 1, d < 0 ? Math.min(i, reflectAt) - 1 : Math.min(i, reflectAt) + 1)));
    setFlipped(false);
  };

  return (
    <div className="flex h-full min-h-[340px] flex-col gap-2">
      <div className="flex items-center gap-1">
        {cards.map((c, i) => (
          <span key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/15">
            {i < cardIdx && <span className="absolute inset-0 bg-editorial-gold" />}
            {i === cardIdx && <span key={`${i}-${playing}`} className={`absolute inset-0 bg-editorial-gold ${playing && i < reflectAt ? 'as-hair' : ''}`} style={playing && i < reflectAt ? { animationDuration: `${dwell}ms` } : undefined} />}
          </span>
        ))}
        <button type="button" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Pause' : 'Play'} className="ml-1 text-editorial-gold">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div onClick={tap} className="relative flex-1 cursor-pointer select-none">
        <div key={cardIdx} className="deck-slide-enter absolute inset-0">
          {card.kind === 'portrait' && <AtlasPortraitCard nominee={nominee} flipped={flipped} onFlip={() => { setPlaying(false); setFlipped(f => !f); }} />}
          {card.kind === 'story' && (
            <div className="flex h-full flex-col justify-center rounded-sm border border-editorial-cream/15 bg-white/5 p-5">
              <p className="text-[9px] font-bold uppercase tracking-widest text-editorial-gold">{card.label}{card.part ? ` · ${card.part}` : ''}</p>
              <p className="mt-2 font-heading text-lg leading-snug text-editorial-cream">{card.text}</p>
            </div>
          )}
          {card.kind === 'reflect' && <AtlasReflectCard nominee={nominee} lit={lit} active={index - reflectAt} onPick={light} />}
        </div>
      </div>
      <p className="text-center text-[9px] uppercase tracking-widest text-editorial-cream/40">Turn or tap to move · centre to {card.kind === 'portrait' ? 'flip' : 'choose'}</p>
    </div>
  );
}