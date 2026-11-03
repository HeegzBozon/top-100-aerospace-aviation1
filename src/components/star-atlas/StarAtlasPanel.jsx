import { useEffect, useState } from 'react';
import { ChevronLeft, X, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AtlasTrail from './AtlasTrail';
import AtlasStarCard from './AtlasStarCard';
import AtlasTrailList from './AtlasTrailList';
import StarCollected from './StarCollected';
import CardCollection from '@/components/cards/CardCollection';

// Orion's Star Atlas, read inside the campus: constellations → stars → one story at a time.
export default function StarAtlasPanel({ passport, onSave, onClose }) {
  const [trails, setTrails] = useState(null);
  const [trail, setTrail] = useState(null);
  const [star, setStar] = useState(null);
  // The Atlas and the cards a visitor holds are the same sky read two ways, so they share
  // one surface rather than two doors.
  const [view, setView] = useState('atlas');
  useEffect(() => {
    base44.entities.Constellation.filter({ status: 'approved' }, { sort: 'order', limit: 30 })
      .then(p => setTrails(p.items || p)).catch(() => setTrails([]));
  }, []);

  const light = (reflection) => {
    if (!passport?.stars?.[star.id]) setCollected(star);
    onSave({ stars: { ...(passport?.stars || {}), [star.id]: { c: trail.id, r: reflection, at: new Date().toISOString() } } });
  };
  const [collected, setCollected] = useState(null);
  const back = () => (star ? setStar(null) : setTrail(null));
  const title = star ? trail.title : trail ? trail.title : 'The Star Atlas';
  const held = Object.keys(passport?.stars || {}).length;

  return (
    <div className="absolute inset-x-2 bottom-2 top-16 z-50 flex flex-col overflow-hidden rounded-md border-2 border-editorial-gold/70 bg-gradient-to-b from-[#0b1826] to-editorial-navy shadow-2xl">
      <div className="flex items-center gap-2 border-b border-editorial-gold/40 px-3 py-2">
        {(trail || star) && <button type="button" onClick={back} aria-label="Back"><ChevronLeft className="h-4 w-4 text-editorial-gold" /></button>}
        <p className="flex-1 truncate font-heading text-base text-editorial-cream">{title}</p>
        <button type="button" onClick={onClose} aria-label="Close"><X className="h-4 w-4 text-editorial-cream/70" /></button>
      </div>
      {!star && !trail && (
        <div className="flex border-b border-editorial-gold/25">
          {[['atlas', 'The Atlas'], ['cards', `Cards${held ? ` · ${held}` : ''}`]].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`flex-1 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                view === key ? 'bg-editorial-gold/15 text-editorial-gold' : 'text-editorial-cream/55'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3">
        {!star && !trail && view === 'cards' ? (
          <CardCollection passport={passport} onGo={() => setView('atlas')} />
        ) : star ? <AtlasStarCard key={star.id} nominee={star} lit={!!passport?.stars?.[star.id]} onLight={light} onBack={() => setStar(null)} />
          : trail ? <AtlasTrail constellation={trail} passport={passport} onOpen={setStar} onClose={() => setTrail(null)} />
          : !trails ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-editorial-gold" /></div>
          : trails.length === 0 ? (
            <div className="py-8 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-editorial-gold" />
              <p className="mt-2 font-heading text-editorial-cream">The sky is being charted.</p>
              <p className="text-xs text-editorial-cream/60">Orion's first constellations open soon. Every star has a story.</p>
            </div>
          ) : <AtlasTrailList trails={trails} passport={passport} onOpen={setTrail} onClose={onClose} />}
      </div>
      {collected && <StarCollected nominee={collected} trail={trail} passport={passport} onClose={() => { setCollected(null); setStar(null); }} />}
    </div>
  );
}