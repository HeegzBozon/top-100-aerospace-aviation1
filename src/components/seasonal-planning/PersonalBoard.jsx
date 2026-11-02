import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Check, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { inSeason } from './seasons';

// The member's own season: their tasks dated inside it, plus anything undated still open.
export default function PersonalBoard({ user, season }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const key = ['personal-tasks', user.id];
  const { data, isLoading, error } = useQuery({
    queryKey: key,
    queryFn: () => base44.entities.PersonalTask.filter({ created_by_id: user.id }, '-created_date', 200),
  });
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await base44.entities.PersonalTask.create({ title: title.trim(), due_date: due || undefined });
    setTitle(''); setDue(''); refresh();
  };
  const toggle = async (t) => { await base44.entities.PersonalTask.update(t.id, { status: t.status === 'done' ? 'todo' : 'done' }); refresh(); };
  const remove = async (t) => { await base44.entities.PersonalTask.delete(t.id); refresh(); };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-editorial-copper" /></div>;
  if (error) return <p className="py-8 text-center font-body text-sm text-editorial-navy/70">Your board could not be loaded.</p>;
  const rows = (data || []).filter((t) => t.due_date ? inSeason(t.due_date, season) : t.status !== 'done');

  return (
    <div>
      <form onSubmit={add} className="mb-3 flex gap-1.5 rounded border border-editorial-navy/10 bg-white p-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`A goal for ${season.name}`} className="min-w-0 flex-1 bg-transparent font-body text-sm text-editorial-navy outline-none" />
        <input type="date" value={due} min={season.start} max={season.end} onChange={(e) => setDue(e.target.value)} className="w-[118px] bg-transparent font-body text-xs text-editorial-navy/70 outline-none" />
        <button aria-label="Add goal" className="rounded bg-editorial-copper p-1.5 text-editorial-cream"><Plus className="h-4 w-4" /></button>
      </form>
      {rows.length === 0 ? (
        <div className="rounded border border-dashed border-editorial-copper/50 bg-white px-4 py-10 text-center">
          <p className="font-heading text-xl text-editorial-navy">Your {season.name} is a blank page.</p>
          <p className="mt-1 font-body text-sm text-editorial-navy/60">Set the first goal you mean to land this season.</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded border border-editorial-navy/10 bg-white px-2.5 py-2">
              <button onClick={() => toggle(t)} aria-label="Toggle done" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${t.status === 'done' ? 'border-editorial-copper bg-editorial-copper text-editorial-cream' : 'border-editorial-navy/30'}`}>{t.status === 'done' && <Check className="h-3 w-3" />}</button>
              <span className={`flex-1 font-body text-sm ${t.status === 'done' ? 'text-editorial-navy/40 line-through' : 'text-editorial-navy'}`}>{t.title}</span>
              {t.due_date && <span className="font-body text-[11px] text-editorial-navy/50">{t.due_date.slice(5)}</span>}
              <button onClick={() => remove(t)} aria-label="Delete" className="text-editorial-navy/30 hover:text-editorial-copper"><Trash2 className="h-3.5 w-3.5" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}