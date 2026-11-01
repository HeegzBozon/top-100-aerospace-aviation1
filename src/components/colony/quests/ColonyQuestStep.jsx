import { useState } from 'react';
import { ArrowRight, Award } from 'lucide-react';
import DialogueBox from '@/components/colony/DialogueBox';
import useColonyListPicker from '@/components/colony/useColonyListPicker';
import { REWARDS } from './firstFlight';
import { lineFor } from './discovery';
import QuestAnswerInput from './QuestAnswerInput';

// One quest, played out with its character: their line, a choice, and the reward.
export default function ColonyQuestStep({ quest, npc, passport, onComplete, onClose }) {
  const [answer, setAnswer] = useState(null);
  const wrong = answer != null && quest.correct != null && answer !== quest.correct;
  const done = answer != null && !wrong;
  const items = done ? [{ key: 'ok', label: 'Continue' }]
    : quest.choices.map((c, i) => ({ key: `c${i}`, label: c, i }));
  const pick = (it) => {
    if (done) { onComplete(quest.choices[answer], answer); return; }
    setAnswer(it.i);
  };
  const cursorKey = useColonyListPicker({ items, onPick: pick, onClose });
  const reward = REWARDS[quest.reward];
  const text = done ? (quest.explain || 'Logged in your Campus Passport.') : wrong ? 'Not quite. Try again.' : `${lineFor(quest, passport)} ${quest.prompt}`;
  if (quest.input) return (
    <div className="absolute inset-x-3 bottom-3 z-30 mx-auto flex max-h-[85%] max-w-md flex-col overflow-y-auto rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 shadow-xl">
      <div className="px-3 pt-3">
        <p className="text-[10px] uppercase tracking-widest text-editorial-gold">The Origin Story · {quest.title}</p>
        <div className="mt-2"><DialogueBox speaker={npc.name} text={`${quest.line} ${quest.prompt}`} /></div>
      </div>
      <QuestAnswerInput onAnswer={(a) => onComplete(a, 0)} />
    </div>
  );
  return (
    <div className="absolute inset-x-3 bottom-3 z-30 mx-auto flex max-h-[85%] max-w-md flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 shadow-xl">
      <div className="flex items-center gap-3 border-b border-editorial-copper/50 px-3 py-2">
        <img src={npc.sprite} alt={npc.name} className="h-12 w-12 shrink-0 rounded bg-editorial-cream object-contain" style={{ imageRendering: 'pixelated' }} />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-editorial-gold">Quest {quest.id.slice(1)} · {quest.place}</p>
          <p className="truncate font-heading text-lg text-editorial-cream">{quest.title}</p>
        </div>
      </div>
      <div className="px-3 pt-2"><DialogueBox speaker={npc.name} text={text} /></div>
      {quest.correct != null && !done && <p className="px-3 pt-1 text-[10px] uppercase tracking-widest text-editorial-gold/80">Practice only · never counted in official results</p>}
      {done && reward && <p className="flex items-center gap-2 px-3 pt-2 text-sm text-editorial-gold"><Award className="h-4 w-4" />{reward.label} earned</p>}
      <ul className="overflow-y-auto p-2">
        {items.map(it => (
          <li key={it.key} id={`colony-list-${it.key}`}>
            <button type="button" onClick={() => pick(it)}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm text-editorial-cream hover:bg-white/5 ${cursorKey === it.key ? 'bg-white/10 ring-1 ring-editorial-gold/70' : ''}`}>
              {it.label}<ArrowRight className="h-4 w-4 text-editorial-gold" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}