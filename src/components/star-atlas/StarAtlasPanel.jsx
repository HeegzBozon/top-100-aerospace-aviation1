import { useEffect, useState } from 'react';
import { ChevronLeft, X, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AtlasTrail from './AtlasTrail';
import AtlasStarCard from './AtlasStarCard';
import { litIn } from './starAtlas';

// Orion's Star Atlas, read inside the campus: constellations → stars → one story at a time.
export default function StarAtlasPanel({ passport, onSave, onClose }) {
  const [trails, setTrails] = useState(null);
  const [trail, setTrail] = useState(null);
  const [star, setStar] = useState(null);
  useEffect(() => {
    base44.entities.Constellation.filter({ status: 'approved' }, { sort: 'order', limit: 30 })
      .then(p => setTrails(p.items || p)).catch(() => setTrails([]));
  }, []);

  const light = (reflection) => {
    onSave({ stars: { ...(passport?.stars || {}), [star.id]: { c: trail.id, r: reflection, at: new Date().toISOString() } } });
  };
  const back = () => (star ? setStar(null) : setTrail(null));
  const title = star ? trail.title : trail ? trail.title : 'The Star Atlas';

  return (
    <div className="absolute inset-x-2 bottom-2 top-16 z-50 flex flex-col overflow-hidden rounded-md border-2 border-editorial-gold/70 bg-gradient-to-b from-[#0b1826] to-editorial-navy shadow-2xl">
      <div className="flex items-center gap-2 border-b border-editorial-gold/40 px-3 py-2">
        {(trail || star) && <button type="button" onClick={back} aria-label="Back"><ChevronLeft className="h-4 w-4 text-editorial-gold" /></button>}
        <p className="flex-1 truncate font-heading text-base text-editorial-cream">{title}</p>
        <button type="button" onClick={onClose} aria-label="Close"><X className="h-4 w-4 text-editorial-cream/70" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {star ? <AtlasStarCard key={star.id} nominee={star} lit={!!passport?.stars?.[star.id]} onLight={light} />
          : trail ? <AtlasTrail constellation={trail} passport={passport} onOpen={setStar} />
          : !trails ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-editorial-gold" /></div>
          : trails.length === 0 ? (
            <div className="py-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-editorial-gold" />
              <p className="mt-2 font-heading text-editorial-cream">The sky is being charted.</p>
              <p className="text-xs text-editorial-cream/60">Orion's first constellations open soon. Every star has a story.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-editorial-cream/70">Every star is an honoree. Read their story to light it.</p>
              {trails.map(t => {
                const n = t.nominee_ids?.length || 0, lit = litIn(passport, t);
                return (
                  <button key={t.id} type="button" onClick={() => setTrail(t)} className="block w-full rounded-sm border border-editorial-cream/15 bg-white/5 p-3 text-left">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-heading text-sm text-editorial-cream">{t.title}</span>
                      <span className={`text-[10px] font-bold ${lit === n && n ? 'text-editorial-gold' : 'text-editorial-cream/50'}`}>{lit === n && n ? '★ Charted' : `${lit}/${n}`}</span>
                    </span>
                    <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-editorial-gold" style={{ width: `${n ? (lit / n) * 100 : 0}%` }} /></span>
                  </button>
                );
              })}
            </div>
          )}
      </div>
    </div>
  );
}