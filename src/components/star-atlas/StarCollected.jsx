import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star } from 'lucide-react';
import { playStampSfx } from '@/components/colony/colonySfx';
import { STAR_XP, litIn } from './starAtlas';

// The beat after a star is lit: a starburst, the seal chime, +XP, and how close the
// constellation is to complete, so the next star is always one tap away.
export default function StarCollected({ nominee, trail, passport, onClose }) {
  const n = trail?.nominee_ids?.length || 0, lit = litIn(passport, trail || {}), done = n > 0 && lit >= n;
  useEffect(() => {
    playStampSfx();
    confetti({ particleCount: done ? 160 : 80, spread: done ? 100 : 70, shapes: ['star'], scalar: 1.1, origin: { y: 0.5 }, colors: ['#C9A87C', '#B87333', '#FAF8F5'] });
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div onClick={onClose} className="as-veil absolute inset-0 z-[60] flex items-center justify-center bg-editorial-navy/70 p-4">
      <div className="as-rise w-full max-w-xs rounded-lg border-2 border-editorial-gold bg-editorial-navy p-4 text-center shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-gold">{done ? 'Constellation complete' : 'Star collected'}</p>
        <div className="mx-auto mt-3 flex h-16 w-16 animate-bounce items-center justify-center rounded-full border-2 border-editorial-copper bg-editorial-gold/20 shadow-[0_0_24px_rgba(201,168,124,0.7)]">
          <Star className="h-8 w-8 fill-editorial-gold text-editorial-gold" />
        </div>
        <h3 className="mt-2 font-heading text-xl text-editorial-cream">{nominee.name}</h3>
        <p className="mt-1 text-sm font-bold text-editorial-gold">+{STAR_XP} XP</p>
        {n > 0 && (
          <div className="mt-3">
            <div className="flex justify-center gap-1">
              {trail.nominee_ids.map(id => (
                <Star key={id} className={`h-3.5 w-3.5 ${passport?.stars?.[id] ? 'fill-editorial-gold text-editorial-gold' : 'text-editorial-cream/25'}`} />
              ))}
            </div>
            <p className="mt-1 text-[11px] text-editorial-cream/60">{trail.title} · {lit}/{n}{done ? '' : ` · ${n - lit} to go`}</p>
          </div>
        )}
      </div>
    </div>
  );
}