import { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { loadStars } from './starAtlas';

// A constellation's stars: dim until read, lit once discovered.
export default function AtlasTrail({ constellation, passport, onOpen }) {
  const [stars, setStars] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => { loadStars(constellation.nominee_ids).then(setStars).catch(() => setError(true)); }, [constellation.id]);
  if (error) return <p className="text-sm text-editorial-cream/70">The sky is clouded over. Try again in a moment.</p>;
  if (!stars) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-editorial-gold" /></div>;
  return (
    <div className="space-y-3">
      {constellation.story && <p className="text-sm italic text-editorial-cream/85">“{constellation.story}”</p>}
      <div className="grid grid-cols-3 gap-2">
        {stars.map(n => {
          const lit = !!passport?.stars?.[n.id];
          const photo = n.avatar_url || n.photo_url;
          return (
            <button key={n.id} type="button" onClick={() => onOpen(n)}
              className={`relative flex flex-col items-center gap-1 rounded-sm border p-2 ${lit ? 'border-editorial-gold bg-editorial-gold/10' : 'border-editorial-cream/15 bg-white/5'}`}>
              <span className={`relative h-12 w-12 overflow-hidden rounded-full ${lit ? 'shadow-[0_0_14px_rgba(201,168,124,0.8)]' : 'opacity-40 grayscale'}`}>
                {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <Star className="m-3 h-6 w-6 text-editorial-gold" />}
              </span>
              <span className="w-full truncate text-center text-[10px] text-editorial-cream/80">{lit ? n.name : n.name.split(' ')[0]}</span>
              {lit && <Star className="absolute right-1 top-1 h-3 w-3 fill-editorial-gold text-editorial-gold" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}