import { Button } from '@/components/ui/button';
import { GitMerge, Loader2 } from 'lucide-react';

export default function DuplicateGroupCard({ group, merging, onMerge }) {
  return (
    <div className="rounded-xl border border-editorial-navy/10 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-[10px] uppercase tracking-widest font-bold text-editorial-copper">
          Matched on {group.matched_on === 'linkedin' ? 'LinkedIn slug' : 'email'} · {group.members.length} records
        </span>
        <Button size="sm" onClick={onMerge} disabled={merging} className="bg-editorial-navy hover:bg-editorial-navy/90 text-white gap-2">
          {merging ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />} Merge into master
        </Button>
      </div>
      <div className="divide-y divide-editorial-navy/5">
        {group.members.map((m, i) => (
          <div key={m.id} className="py-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${i === 0 ? 'bg-editorial-gold/20 text-editorial-navy font-bold' : 'bg-editorial-cream text-editorial-navy/50'}`}>
              {i === 0 ? 'Master' : 'Retire'}
            </span>
            <span className="font-medium text-editorial-navy">{m.name}</span>
            <span className="text-editorial-navy/50">{m.nominee_email || 'no email'}</span>
            <span className="text-editorial-navy/50 capitalize">{m.status}</span>
            <span className="text-editorial-navy/40 text-xs">{new Date(m.created_date).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}