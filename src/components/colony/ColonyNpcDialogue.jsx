import { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import DialogueBox from '@/components/colony/DialogueBox';
import useColonyListPicker from '@/components/colony/useColonyListPicker';

// One staff character, spoken to: portrait, greeting, and only their configured actions.
export default function ColonyNpcDialogue({ npc, onAction, onClose, quest = null, onQuest, coaching = null }) {
  // The First Flight comes first when this character has a step to give.
  const questItem = quest && { key: '__quest', label: quest.lock ? `★ ${quest.title} — ${quest.lock}` : `★ Quest: ${quest.title}`, disabled: !!quest.lock };
  // A right-time prompt from the shared brief: optional, and always skippable.
  const coachItem = coaching && !(coaching.action.panel === 'quest' && !questItem) && { ...coaching.action, label: `✦ ${coaching.action.label}` };
  const items = [...(questItem ? [questItem] : []), ...(coachItem ? [coachItem] : []), ...npc.actions, { key: '__bye', label: 'Goodbye' }];
  const pick = (it) => {
    if (it.disabled) return;
    if (it.key === '__bye') onClose(); else if (it.key === '__quest' || it.panel === 'quest') onQuest(); else onAction(it);
  };
  const cursorKey = useColonyListPicker({ items, onPick: pick, onClose });
  // Keep the highlighted option on screen as the wheel moves through the list.
  useEffect(() => { document.getElementById(`colony-list-${cursorKey}`)?.scrollIntoView({ block: 'nearest' }); }, [cursorKey]);
  return (
    <div className="absolute inset-x-3 bottom-3 z-30 mx-auto flex max-h-[85%] max-w-md flex-col overflow-hidden rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 shadow-xl">
      <div className="flex items-center gap-3 border-b border-editorial-copper/50 px-3 py-2">
        <img src={npc.sprite} alt={npc.name} className="h-14 w-14 shrink-0 rounded bg-editorial-cream object-contain" style={{ imageRendering: 'pixelated' }} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-lg text-editorial-cream">{npc.name}</p>
          <p className="truncate text-[10px] uppercase tracking-widest text-editorial-gold">{npc.role}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="text-editorial-cream/70"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex max-h-[38dvh] min-h-[88px] flex-col px-3 pt-2"><DialogueBox speaker={npc.name} text={coachItem ? `${npc.greeting} ${coaching.line}` : `${npc.greeting} "${npc.signature}"`} /></div>
      <ul className="min-h-[96px] shrink overflow-y-auto overscroll-contain p-2">
        {items.map(it => (
          <li key={it.key} id={`colony-list-${it.key}`}>
            <button type="button" onClick={() => pick(it)}
              className={`flex w-full items-center justify-between min-h-[44px] rounded px-3 py-2 text-left text-sm text-editorial-cream hover:bg-white/5 ${cursorKey === it.key ? 'bg-white/10 ring-1 ring-editorial-gold/70' : ''}`}>
              {it.label}<ArrowRight className="h-4 w-4 text-editorial-gold" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}