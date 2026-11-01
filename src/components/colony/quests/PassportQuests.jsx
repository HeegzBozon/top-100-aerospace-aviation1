import { REWARDS, QUESTS, ACTS, earned, stampCount, title, nextQuest, isDone } from './firstFlight';
import PassportQuestRow from './PassportQuestRow';

const ring = (pct) => ({ background: `conic-gradient(#C9A87C ${pct * 3.6}deg, rgba(255,255,255,0.08) 0)` });

// The checklist: a filling ring, the reward shelf, then each act with its own bar.
export default function PassportQuests({ passport }) {
  const got = earned(passport);
  const next = nextQuest(passport);
  const done = QUESTS.filter(q => q.act < 5 && isDone(passport, q.id)).length;
  const pct = Math.round((done / 12) * 100);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded border border-editorial-gold/40 bg-editorial-gold/5 p-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full p-1" style={ring(pct)}>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-editorial-navy">
            <span className="font-heading text-lg leading-none text-editorial-cream">{pct}%</span>
            <span className="text-[8px] uppercase tracking-widest text-editorial-gold">{done}/12</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-editorial-gold">{title(passport)}</p>
          <p className="text-xs text-editorial-cream">{stampCount(passport)}/6 Discovery Stamps</p>
          <p className="mt-1 text-[11px] italic text-editorial-cream/60">{next ? `Up next: ${next.title} in the ${next.place}` : 'The First Flight is complete.'}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(REWARDS).filter(([, r]) => r.kind !== 'item').map(([k, r]) => (
          <span key={k} className={`rounded-full border px-2 py-0.5 text-[10px] ${got.includes(k) ? 'border-editorial-gold bg-editorial-gold/25 text-editorial-cream shadow-[0_0_8px_rgba(201,168,124,0.5)]' : 'border-dashed border-editorial-cream/25 text-editorial-cream/35'}`}>
            {got.includes(k) ? `★ ${r.label}` : '? ? ?'}
          </span>
        ))}
      </div>
      {[1, 2, 3, 4, 5].map(act => {
        const qs = QUESTS.filter(q => q.act === act);
        const n = qs.filter(q => isDone(passport, q.id)).length;
        return (
          <div key={act}>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-editorial-gold">{ACTS[act]}</p>
              <span className="text-[10px] text-editorial-cream/50">{n === qs.length ? '✓ Cleared' : `${n}/${qs.length}`}</span>
            </div>
            <div className="mb-1 h-0.5 bg-white/10"><div className="h-full bg-editorial-gold transition-all" style={{ width: `${(n / qs.length) * 100}%` }} /></div>
            {qs.map(q => <PassportQuestRow key={q.id} passport={passport} quest={q} isNext={next?.id === q.id} />)}
          </div>
        );
      })}
      <p className="text-[10px] text-editorial-cream/40">Campus titles and Wings are gameplay achievements. They are never an official TOP 100 designation and never enter measurement.</p>
    </div>
  );
}