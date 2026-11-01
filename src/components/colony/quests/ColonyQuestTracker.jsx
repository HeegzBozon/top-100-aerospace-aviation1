import { useEffect } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import { QUESTS, nextQuest, isDone, stampCount, xpOf, questXp, XP_PER_LEVEL } from './firstFlight';

// The top HUD: level, an XP bar that glows as it fills, stamps, and the next quest with its reward.
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
  const { level, into } = xpOf(passport);
  return (
    <button type="button" onClick={onOpen} aria-label="Open quest checklist"
      className="absolute inset-x-0 top-0 z-40 border-b border-editorial-copper/60 bg-gradient-to-b from-[#0b1826]/95 to-editorial-navy/85 px-2 pb-1.5 pt-1 text-left shadow-[0_6px_18px_rgba(3,6,13,0.55)] backdrop-blur-sm">
      <span className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-md border border-editorial-gold bg-gradient-to-br from-editorial-gold/35 to-editorial-copper/25 shadow-[0_0_12px_rgba(201,168,124,0.5)]">
          <span className="text-[7px] font-bold uppercase leading-none tracking-widest text-editorial-gold">Lv</span>
          <span className="font-heading text-sm leading-none text-editorial-cream">{level}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-editorial-cream">
            <Sparkles className="h-3 w-3 shrink-0 animate-pulse text-editorial-gold" />
            <span className="truncate">{next ? next.title : 'First Flight complete'}</span>
            {next && <span className="ml-auto shrink-0 text-[9px] font-bold text-editorial-gold">+{questXp(next)} XP</span>}
          </span>
          <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10">
            <span className="yp-fill block h-full rounded-full" style={{ width: `${Math.max(3, (into / XP_PER_LEVEL) * 100)}%` }} />
          </span>
          <span className="mt-0.5 flex justify-between text-[8px] font-bold uppercase tracking-widest text-editorial-cream/55">
            <span>{into}/{XP_PER_LEVEL} XP</span><span>Quests {done}/12 · Stamps {stampCount(passport)}/6 · Stars {Object.keys(passport.stars || {}).length}</span>
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-editorial-gold/70" />
      </span>
    </button>
  );
}