import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ExternalLink } from 'lucide-react';
import { REFLECTIONS, READ_MS, STAR_XP, storyOf } from './starAtlas';

// One honoree's story, read in the game. The star lights after a real read: a moment with the
// story and a reflection on what stood out. The full profile is one key away for the whole record.
export default function AtlasStarCard({ nominee, lit, onLight }) {
  const [ready, setReady] = useState(lit);
  const [pick, setPick] = useState(null);
  useEffect(() => { if (lit) return; const t = setTimeout(() => setReady(true), READ_MS); return () => clearTimeout(t); }, [lit]);
  const photo = nominee.avatar_url || nominee.photo_url;
  const story = storyOf(nominee);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {photo ? <img src={photo} alt="" className="h-14 w-14 rounded-full border-2 border-editorial-gold object-cover" />
          : <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-editorial-gold font-heading text-xl text-editorial-cream">{nominee.name?.[0]}</span>}
        <div className="min-w-0">
          <p className="font-heading text-lg leading-tight text-editorial-cream">{nominee.name}</p>
          <p className="truncate text-xs text-editorial-cream/60">{[nominee.title, nominee.company].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {story.length ? story.map(s => (
        <div key={s.label}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-editorial-gold">{s.label}</p>
          <p className="text-sm leading-relaxed text-editorial-cream/90">{s.text}</p>
        </div>
      )) : <p className="text-sm text-editorial-cream/70">Their story is still being written. Open the full profile for the record.</p>}
      <Link to={`/profiles/${nominee.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-editorial-gold underline">
        Read the full profile <ExternalLink className="h-3 w-3" />
      </Link>
      {lit ? (
        <p className="flex items-center gap-1.5 rounded-sm border border-editorial-gold/60 bg-editorial-gold/10 p-2 text-xs font-semibold text-editorial-gold"><Star className="h-3.5 w-3.5 fill-current" /> Star lit. Their story is in your Atlas.</p>
      ) : (
        <div className="space-y-1.5 border-t border-editorial-cream/15 pt-3">
          <p className="text-xs text-editorial-cream/80">What stood out to you?</p>
          {REFLECTIONS.map(r => (
            <button key={r.key} type="button" onClick={() => setPick(r.key)}
              className={`block w-full rounded-sm border px-3 py-2 text-left text-xs ${pick === r.key ? 'border-editorial-gold bg-editorial-gold/15 text-editorial-cream' : 'border-editorial-cream/20 text-editorial-cream/75'}`}>{r.label}</button>
          ))}
          <button type="button" disabled={!ready || !pick} onClick={() => onLight(pick)}
            className="mt-1 w-full rounded-sm bg-editorial-copper py-2 text-xs font-bold uppercase tracking-widest text-editorial-cream disabled:opacity-40">
            {ready ? `Light this star · +${STAR_XP} XP` : 'Reading…'}
          </button>
        </div>
      )}
    </div>
  );
}