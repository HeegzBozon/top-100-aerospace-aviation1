import { useEffect, useState } from 'react';
import { X, Check, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { loadStars } from './starAtlas';

// One drafted constellation under editorial review: rename, retell, drop stars, approve.
export default function StudioTrailCard({ trail, onSave }) {
  const [stars, setStars] = useState([]);
  const [title, setTitle] = useState(trail.title);
  const [story, setStory] = useState(trail.story || '');
  useEffect(() => { loadStars(trail.nominee_ids).then(setStars); }, [trail.nominee_ids]);
  const drop = (id) => onSave({ nominee_ids: trail.nominee_ids.filter(x => x !== id) });
  return (
    <div className="space-y-3 border border-editorial-copper/30 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${trail.status === 'approved' ? 'bg-editorial-navy text-editorial-cream' : 'bg-editorial-sand text-editorial-navy'}`}>{trail.status}</span>
        <span className="text-xs text-editorial-navy/60">{stars.length} stars</span>
      </div>
      <Input value={title} onChange={e => setTitle(e.target.value)} onBlur={() => title !== trail.title && onSave({ title })} />
      <Textarea value={story} onChange={e => setStory(e.target.value)} onBlur={() => story !== trail.story && onSave({ story })} rows={2} placeholder="What Orion says when the trail opens" />
      <div className="flex flex-wrap gap-1.5">
        {stars.map(n => (
          <span key={n.id} className="pd-chip flex items-center gap-1 px-2 py-0.5">{n.name}
            <button type="button" onClick={() => drop(n.id)} aria-label={`Remove ${n.name}`}><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {trail.status !== 'approved' && <Button size="sm" className="bg-editorial-copper hover:bg-editorial-copper/90" onClick={() => onSave({ status: 'approved' })}><Check className="mr-1 h-3.5 w-3.5" />Approve</Button>}
        {trail.status !== 'archived' && <Button size="sm" variant="outline" onClick={() => onSave({ status: 'archived' })}><Archive className="mr-1 h-3.5 w-3.5" />Archive</Button>}
        {trail.status === 'archived' && <Button size="sm" variant="outline" onClick={() => onSave({ status: 'draft' })}>Restore to draft</Button>}
      </div>
    </div>
  );
}