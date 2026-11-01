import useColonyListPicker from '@/components/colony/useColonyListPicker';
import { litIn } from './starAtlas';

// The constellations, one card each, walked by the wheel.
export default function AtlasTrailList({ trails, passport, onOpen, onClose }) {
  const items = trails.map(t => ({ key: t.id, label: t.title, t }));
  const cur = useColonyListPicker({ items, onPick: (it) => onOpen(it.t), onClose });
  return (
    <div className="space-y-2">
      <p className="text-xs text-editorial-cream/70">Every star is an honoree. Read their story to light it.</p>
      {trails.map(t => {
        const n = t.nominee_ids?.length || 0, lit = litIn(passport, t), done = n && lit === n;
        return (
          <button key={t.id} id={`colony-list-${t.id}`} type="button" onClick={() => onOpen(t)}
            className={`block w-full rounded-sm border p-3 text-left ${cur === t.id ? 'border-editorial-gold bg-editorial-gold/10' : 'border-editorial-cream/15 bg-white/5'}`}>
            <span className="flex items-center justify-between gap-2">
              <span className="font-heading text-sm text-editorial-cream">{t.title}</span>
              <span className={`text-[10px] font-bold ${done ? 'text-editorial-gold' : 'text-editorial-cream/50'}`}>{done ? '★ Charted' : `${lit}/${n}`}</span>
            </span>
            <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full bg-editorial-gold" style={{ width: `${n ? (lit / n) * 100 : 0}%` }} /></span>
          </button>
        );
      })}
    </div>
  );
}