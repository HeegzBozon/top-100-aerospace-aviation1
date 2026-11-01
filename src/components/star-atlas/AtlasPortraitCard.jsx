import { RotateCw } from 'lucide-react';

// The opening card: portrait on the face, the record's facts on the back. Centre / tap flips it.
export default function AtlasPortraitCard({ nominee, flipped, onFlip }) {
  const photo = nominee.avatar_url || nominee.photo_url;
  const facts = [['Role', nominee.title], ['Organization', nominee.company], ['Field', nominee.industry], ['Based in', nominee.country]].filter(f => f[1]);
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onFlip(); }} className="card-flip-container block h-full w-full text-left" aria-label="Flip card">
      <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`}>
        <div className="card-flip-front flex flex-col items-center justify-center gap-3 rounded-sm border border-editorial-gold/50 bg-white/5 p-4">
          {photo ? <img src={photo} alt="" className="h-28 w-28 rounded-full border-2 border-editorial-gold object-cover shadow-[0_0_24px_rgba(201,168,124,0.45)]" />
            : <span className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-editorial-gold font-heading text-4xl text-editorial-cream">{nominee.name?.[0]}</span>}
          <p className="text-center font-heading text-2xl leading-tight text-editorial-cream">{nominee.name}</p>
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-editorial-gold/80"><RotateCw className="h-3 w-3" /> Flip for the record</span>
        </div>
        <div className="card-flip-back flex flex-col justify-center gap-3 rounded-sm border border-editorial-copper bg-editorial-navy p-5">
          {facts.length ? facts.map(([k, v]) => (
            <div key={k}><p className="text-[9px] font-bold uppercase tracking-widest text-editorial-gold">{k}</p><p className="text-sm text-editorial-cream">{v}</p></div>
          )) : <p className="text-sm text-editorial-cream/70">The record is still being filed.</p>}
        </div>
      </div>
    </button>
  );
}