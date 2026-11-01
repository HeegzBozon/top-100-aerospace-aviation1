import { Star } from 'lucide-react';
import useColonyListPicker from '@/components/colony/useColonyListPicker';

// A constellation's stars: dim until read, lit once discovered. The wheel walks them in order.
export default function AtlasStarGrid({ stars, passport, onOpen, onClose }) {
  const items = stars.map(n => ({ key: n.id, label: n.name, n }));
  const cur = useColonyListPicker({ items, onPick: (it) => onOpen(it.n), onClose });
  return (
    <div className="grid grid-cols-3 gap-2">
      {stars.map(n => {
        const lit = !!passport?.stars?.[n.id];
        const photo = n.avatar_url || n.photo_url;
        return (
          <button key={n.id} id={`colony-list-${n.id}`} type="button" onClick={() => onOpen(n)}
            className={`relative flex flex-col items-center gap-1 rounded-sm border p-2 ${cur === n.id ? 'border-editorial-cream ring-1 ring-editorial-gold' : lit ? 'border-editorial-gold bg-editorial-gold/10' : 'border-editorial-cream/15 bg-white/5'}`}>
            <span className={`relative h-12 w-12 overflow-hidden rounded-full ${lit ? 'shadow-[0_0_14px_rgba(201,168,124,0.8)]' : 'opacity-40 grayscale'}`}>
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <Star className="m-3 h-6 w-6 text-editorial-gold" />}
            </span>
            <span className="w-full truncate text-center text-[10px] text-editorial-cream/80">{lit ? n.name : n.name.split(' ')[0]}</span>
            {lit && <Star className="absolute right-1 top-1 h-3 w-3 fill-editorial-gold text-editorial-gold" />}
          </button>
        );
      })}
    </div>
  );
}