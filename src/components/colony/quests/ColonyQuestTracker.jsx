import { useEffect } from 'react';
import { ScrollText } from 'lucide-react';
import { QUESTS, nextQuest, isDone } from './firstFlight';

// A quiet tab hung from the top edge: the next step and a thin filling rule.
// Tap it (or press P) to open the full checklist in the Campus Passport.
export default function ColonyQuestTracker({ passport, onOpen }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'p' || e.key === 'P') onOpen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpen]);
  if (!passport) return null;
  const done = QUESTS.filter(q => q.act < 5 && isDone(passport, q.id)).length;
  const next = nextQuest(passport);
  return (
    <button type="button" onClick={onOpen} aria-label="Open quest checklist"
      className="absolute left-1/2 top-0 z-40 w-[56%] max-w-[220px] -translate-x-1/2 overflow-hidden rounded-b-md border border-t-0 border-editorial-copper/50 bg-editorial-navy/80 text-left backdrop-blur-sm">
      <span className="flex items-center gap-1.5 px-2 py-0.5">
        <ScrollText className="h-3 w-3 shrink-0 text-editorial-gold/80" />
        <span className="truncate text-[10px] text-editorial-cream/85">{next ? next.title : 'First Flight complete'}</span>
        <span className="ml-auto shrink-0 text-[9px] font-bold text-editorial-gold">{done}/12</span>
      </span>
      <span className="block h-px bg-white/10"><span className="block h-full bg-editorial-gold" style={{ width: `${(done / 12) * 100}%` }} /></span>
    </button>
  );
}