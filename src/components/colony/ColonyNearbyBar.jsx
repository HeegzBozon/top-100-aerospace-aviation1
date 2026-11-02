import { Users, MessageSquare } from 'lucide-react';

// Who is within earshot right now: one chip per person, each opening the ways to reach
// them (chat, AeroSync, a card exchange). Voice and video already follow proximity.
export default function ColonyNearbyBar({ people, onPick, onChat }) {
  if (!people.length) return null;
  return (
    <div className="absolute left-1/2 top-12 z-40 flex max-w-[90%] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-full border border-[#C9A87C]/40 bg-slate-950/80 px-2 py-1 backdrop-blur scrollbar-hide">
      <Users className="h-3.5 w-3.5 shrink-0 text-[#C9A87C]" />
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[#C9A87C]">Nearby</span>
      {people.map((p) => (
        <button key={p.session_id} type="button" onClick={() => onPick(p)}
          className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white hover:bg-[#B87333]">
          {p.user_name || 'Participant'}
        </button>
      ))}
      <button type="button" onClick={onChat} aria-label="Open room chat"
        className="shrink-0 rounded-full p-1 text-white/80 hover:bg-white/10">
        <MessageSquare className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}