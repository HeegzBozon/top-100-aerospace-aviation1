import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, ArrowRight } from 'lucide-react';
import { REWARDS, nextQuest, stampCount } from './firstFlight';

// The beat after a quest: the reward lands, the stamp tally ticks, and the next step is named.
export default function QuestCelebration({ quest, passport, onClose }) {
  const reward = REWARDS[quest.reward];
  const next = nextQuest(passport);
  useEffect(() => {
    confetti({ particleCount: reward ? 110 : 50, spread: 75, origin: { y: 0.55 }, colors: ['#C9A87C', '#B87333', '#FAF8F5', '#1E3A5A'] });
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div onClick={onClose} className="as-veil absolute inset-0 z-40 flex items-center justify-center bg-editorial-navy/70 p-4">
      <div className="as-rise w-full max-w-xs rounded-lg border-2 border-editorial-gold bg-editorial-navy p-4 text-center shadow-2xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-gold">Quest complete</p>
        <h3 className="mt-1 font-heading text-2xl text-editorial-cream">{quest.title}</h3>
        {reward && (
          <div className="mx-auto mt-3 flex h-16 w-16 animate-bounce items-center justify-center rounded-full border-2 border-editorial-copper bg-editorial-gold/20">
            <Award className="h-8 w-8 text-editorial-gold" />
          </div>
        )}
        {reward && <p className="mt-2 text-sm text-editorial-gold">{reward.label} earned</p>}
        <p className="mt-1 text-[11px] text-editorial-cream/60">Discovery Stamps · {stampCount(passport)}/6</p>
        <div className="mt-4 rounded border border-editorial-copper/50 bg-white/5 p-2 text-left">
          <p className="text-[9px] font-bold uppercase tracking-widest text-editorial-gold">Next up</p>
          <p className="flex items-center gap-1 text-sm text-editorial-cream">
            {next ? <>{next.title} <ArrowRight className="h-3 w-3" /> {next.place}</> : 'First Flight complete. Well flown.'}
          </p>
        </div>
      </div>
    </div>
  );
}