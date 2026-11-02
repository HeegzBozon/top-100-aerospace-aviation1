import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { inSeason } from './seasons';

const COLUMNS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'next_up', label: 'Committed this season' },
  { key: 'in_progress', label: 'In flight' },
  { key: 'done', label: 'Released' },
];
const NEXT = { backlog: 'next_up', next_up: 'in_progress', in_progress: 'done' };

// The season board: the platform roadmap for one season, ordered by WSJF. Dated items show in
// the season they land in; undated work stays on every season's board until it is released.
export default function PIBoard({ isAdmin, season }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['pi-board'],
    queryFn: () => base44.entities.RoadmapItem.list('-wsjf_score', 200),
  });

  const advance = async (item) => {
    await base44.entities.RoadmapItem.update(item.id, { status: NEXT[item.status] })
      .then(() => qc.invalidateQueries({ queryKey: ['pi-board'] }))
      .catch(() => toast.error('Only the planning team can move items.'));
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>;
  if (error) return <p className="py-8 text-center font-body text-sm text-editorial-navy/70">The board could not be loaded. Try again shortly.</p>;
  const rows = (data || []).filter((i) => i.target_date ? inSeason(i.target_date, season) : i.status !== 'done');
  if (!rows.length) return (
    <div className="rounded border border-dashed border-editorial-copper/50 bg-white px-4 py-10 text-center">
      <p className="font-heading text-xl text-editorial-navy">{season.name} is unplanned.</p>
      <p className="mt-1 font-body text-sm text-editorial-navy/60">Roadmap items appear here once they are added to the backlog.</p>
    </div>
  );

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {COLUMNS.map((c) => {
        const items = rows.filter((i) => (i.status || 'backlog') === c.key);
        return (
          <section key={c.key} className="rounded border border-editorial-navy/10 bg-white p-2">
            <h2 className="pd-label mb-2 flex justify-between">{c.label}<span>{items.length}</span></h2>
            {items.length === 0 && <p className="py-3 text-center font-body text-xs text-editorial-navy/40">Nothing here</p>}
            <ul className="space-y-1.5">
              {items.map((i) => (
                <li key={i.id} className="rounded border border-editorial-navy/10 bg-editorial-cream p-2">
                  <div className="flex items-start gap-2">
                    <p className="flex-1 font-body text-[13px] font-semibold leading-snug text-editorial-navy">{i.title}</p>
                    {isAdmin && NEXT[i.status || 'backlog'] && (
                      <button onClick={() => advance({ ...i, status: i.status || 'backlog' })} aria-label="Advance" className="rounded p-0.5 text-editorial-copper hover:bg-editorial-sand">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 font-body text-[10px] uppercase tracking-[0.14em] text-editorial-label">
                    {[i.horizon?.toUpperCase(), i.value_stream, i.wsjf_score != null && `WSJF ${Math.round(i.wsjf_score * 10) / 10}`].filter(Boolean).join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}