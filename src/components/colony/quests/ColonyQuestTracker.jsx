import { useEffect } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { QUESTS, nextQuest, isDone, stampCount } from './firstFlight';

const hype = (left) => left === 0 ? 'Wings earned. Legend status.' : left === 1 ? 'One quest from your Wings!' : left <= 3 ? `So close. ${left} to go.` : `${left} quests to your Wings`;

// Always on screen: a filling bar, the stamp count, and the very next thing to do.
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
  const pct = Math.round((done / 12) * 100);
  const next = nextQuest(passport);
  return (
    <button type="button" onClick={onOpen} aria-label="Open quest checklist"
      className="absolute left-2 top-12 z-20 w-[62%] max-w-[240px] overflow-hidden rounded-md border border-editorial-copper/70 bg-editorial-navy/90 text-left shadow-[0_0_14px_rgba(201,168,124,0.35)]">
      <span className="flex items-center gap-2 px-2 pt-1.5">
        <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-editorial-gold bg-editorial-gold/15 text-[10px] font-bold text-editorial-gold">
          {stampCount(passport)}
          {next && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-ping rounded-full bg-editorial-gold" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-bold uppercase tracking-widest text-editorial-gold">First Flight · {pct}%</span>
          <span className="flex items-center gap-0.5 truncate text-[11px] text-editorial-cream">
            {next ? <><Sparkles className="h-3 w-3 shrink-0 text-editorial-gold" />{next.title}</> : 'Complete'}
          </span>
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-editorial-gold/70" />
      </span>
      <span className="block px-2 pb-1 pt-0.5 text-[9px] italic text-editorial-cream/60">{hype(12 - done)}</span>
      <span className="block h-1 bg-white/10">
        <span className="yp-fill block h-full" style={{ width: `${Math.max(pct, 4)}%` }} />
      </span>
    </button>
  );
}