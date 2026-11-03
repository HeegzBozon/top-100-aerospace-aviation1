import { Check, Lock, Sparkles, Circle } from 'lucide-react';
import { REWARDS, isDone, lockReason, questXp } from './firstFlight';

// One quest: done reads as won, the next one glows, locked ones keep their mystery.
export default function PassportQuestRow({ passport, quest: q, isNext }) {
  const done = isDone(passport, q.id), lock = !done && lockReason(passport, q);
  const Icon = done ? Check : lock ? Lock : isNext ? Sparkles : Circle;
  const reward = REWARDS[q.reward];
  // The East Wing completes at the machine, not in conversation, so it has no answer to read.
  const chose = passport?.quests?.[q.id]?.choice;
  return (
    <div className={`flex items-start gap-2 border-b border-white/5 px-1 py-1.5 ${isNext ? 'rounded border border-editorial-gold/60 bg-editorial-gold/10 shadow-[0_0_10px_rgba(201,168,124,0.3)]' : ''}`}>
      <Icon className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${done || isNext ? 'text-editorial-gold' : 'text-editorial-cream/40'} ${isNext ? 'animate-pulse' : ''}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${done ? 'text-editorial-cream/60 line-through decoration-editorial-gold/60' : lock ? 'text-editorial-cream/45' : 'text-editorial-cream'}`}>
          {lock ? '? ? ? ' : ''}{q.title}
        </p>
        <p className="text-[11px] text-editorial-cream/45">
          {isNext ? `Go now · ${q.place}` : lock || (done ? (chose ? `Chose: ${chose}` : `Struck · ${q.place}`) : q.place)}
        </p>
      </div>
      <span className={`shrink-0 text-right text-[9px] uppercase tracking-wider ${done ? 'text-editorial-gold' : 'text-editorial-cream/40'}`}>
        {done ? `★ +${questXp(q)} XP` : `+${questXp(q)} XP`}
        {reward && reward.kind !== 'item' && !done && <span className="block">+ reward</span>}
      </span>
    </div>
  );
}