import { Link } from 'react-router-dom';
import { Star, ExternalLink } from 'lucide-react';
import { REFLECTIONS, STAR_XP } from './starAtlas';

// The closing card: what stood out lights the star. The wheel walks the three choices.
export default function AtlasReflectCard({ nominee, lit, active, onPick }) {
  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded-sm border border-editorial-gold/50 bg-white/5 p-4">
      {lit ? (
        <p className="flex items-center justify-center gap-1.5 text-center font-heading text-lg text-editorial-gold"><Star className="h-5 w-5 fill-current" /> Star lit</p>
      ) : (
        <>
          <p className="font-heading text-lg text-editorial-cream">What stood out to you?</p>
          {REFLECTIONS.map((r, i) => (
            <button key={r.key} type="button" onClick={(e) => { e.stopPropagation(); onPick(r.key); }}
              className={`w-full rounded-sm border px-3 py-2.5 text-left text-sm ${active === i ? 'border-editorial-gold bg-editorial-gold/20 text-editorial-cream' : 'border-editorial-cream/20 text-editorial-cream/75'}`}>{r.label}</button>
          ))}
          <p className="text-center text-[10px] uppercase tracking-widest text-editorial-gold/80">Choose to light this star · +{STAR_XP} XP</p>
        </>
      )}
      <Link to={`/profiles/${nominee.id}`} onClick={(e) => e.stopPropagation()} className="mt-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-editorial-gold underline">
        Read the full profile <ExternalLink className="h-3 w-3" />
      </Link>
    </div>
  );
}