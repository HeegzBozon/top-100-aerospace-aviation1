import { Check, Lock, Circle } from 'lucide-react';
import { QUESTS, ACTS, REWARDS, isDone, lockReason, earned, stampCount, title, nextQuest } from './firstFlight';

// The tracker: twelve quests by act, the stamps and emblems, and the next step.
export default function PassportQuests({ passport }) {
  const got = earned(passport);
  const next = nextQuest(passport);
  return (
    <div className="space-y-4">
      <div className="rounded border border-editorial-gold/40 p-3">
        <p className="text-[10px] uppercase tracking-widest text-editorial-gold">{title(passport)} · {stampCount(passport)}/6 stamps</p>
        <p className="mt-1 text-sm text-editorial-cream">{next ? `Next: ${next.title} — find ${next.npc === 'founder' ? 'The Founder' : next.npc[0].toUpperCase() + next.npc.slice(1)} in the ${next.place}.` : 'The First Flight is complete.'}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {Object.entries(REWARDS).filter(([, r]) => r.kind !== 'item').map(([k, r]) => (
            <span key={k} className={`rounded-full border px-2 py-0.5 text-[10px] ${got.includes(k) ? 'border-editorial-gold bg-editorial-gold/20 text-editorial-cream' : 'border-dashed border-editorial-cream/25 text-editorial-cream/40'}`}>{r.label}</span>
          ))}
        </div>
      </div>
      {[1, 2, 3, 4].map(act => (
        <div key={act}>
          <p className="mb-1 text-[10px] uppercase tracking-widest text-editorial-gold">{ACTS[act]}</p>
          {QUESTS.filter(q => q.act === act).map(q => {
            const done = isDone(passport, q.id), lock = !done && lockReason(passport, q);
            const Icon = done ? Check : lock ? Lock : Circle;
            return (
              <div key={q.id} className="flex items-start gap-2 border-b border-white/5 py-1.5">
                <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${done ? 'text-editorial-gold' : 'text-editorial-cream/40'}`} />
                <div className="min-w-0">
                  <p className={`text-sm ${done ? 'text-editorial-cream' : 'text-editorial-cream/70'}`}>{q.id.slice(1)} · {q.title}</p>
                  <p className="text-[11px] text-editorial-cream/45">{lock || (done ? `Chose: ${passport.quests[q.id].choice}` : q.place)}</p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <p className="text-[10px] text-editorial-cream/40">Campus titles and Wings are gameplay achievements. They are never an official TOP 100 designation and never enter measurement.</p>
    </div>
  );
}