import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { DESTINATIONS } from '@/components/colony/conciergeActions';

// What the concierge offers to do next: open a surface, or one of the people it found.
export default function ConciergeAction({ action }) {
  const navigate = useNavigate();
  if (!action) return null;
  const btn = 'flex w-full items-center justify-between gap-2 rounded-sm border border-editorial-copper bg-editorial-copper/20 px-2 py-1 text-left font-mono text-[11px] text-editorial-cream';

  if (action.kind === 'navigate' && DESTINATIONS[action.destination]) {
    const d = DESTINATIONS[action.destination];
    return <button type="button" onClick={() => navigate(d.path)} className={`mt-2 ${btn}`}>Take me to {d.label}<ArrowRight className="h-3 w-3 flex-none" /></button>;
  }
  if (action.kind === 'find_person') {
    if (!action.people?.length) return <p className="mt-2 font-mono text-[11px] text-editorial-cream/60">No one by that name in the directory yet.</p>;
    return (
      <div className="mt-2 space-y-1">
        {action.people.map(p => (
          <button key={p.id} type="button" onClick={() => navigate(`/profiles/${p.id}`)} className={btn}>
            <span className="min-w-0 truncate">{p.name}{p.line && <span className="text-editorial-cream/60"> · {p.line}</span>}</span>
            <ArrowRight className="h-3 w-3 flex-none" />
          </button>
        ))}
      </div>
    );
  }
  return null;
}