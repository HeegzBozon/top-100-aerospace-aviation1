import { useEffect } from 'react';
import { ScrollText } from 'lucide-react';
import { QUESTS, nextQuest, isDone } from './firstFlight';

// Always on screen: how far through the First Flight you are and what comes next.
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
      className="absolute left-2 top-12 z-20 flex max-w-[60%] items-center gap-2 rounded-md border border-editorial-copper/60 bg-editorial-navy/90 px-2 py-1 text-left shadow">
      <ScrollText className="h-4 w-4 shrink-0 text-editorial-gold" />
      <span className="min-w-0">
        <span className="block text-[9px] font-bold uppercase tracking-widest text-editorial-gold">First Flight · {done}/12</span>
        <span className="block truncate text-[11px] text-editorial-cream">{next ? `${next.title} · ${next.place}` : 'Complete'}</span>
      </span>
    </button>
  );
}