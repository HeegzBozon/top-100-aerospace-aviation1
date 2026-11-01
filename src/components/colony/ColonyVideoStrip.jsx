import ColonyVideoTile from '@/components/colony/ColonyVideoTile';

// The room's faces, a reel under the masthead: you first, then everyone else, scrolling sideways.
export default function ColonyVideoStrip({ participants, localSessionId }) {
  const ordered = [
    ...participants.filter(p => p.session_id === localSessionId),
    ...participants.filter(p => p.session_id !== localSessionId),
  ];
  if (!ordered.length) return null;
  return (
    <div className="flex gap-2 overflow-x-auto px-3 pb-2 pt-1 scrollbar-hide">
      {ordered.map(p => {
        const local = p.session_id === localSessionId;
        return (
          <div key={p.session_id} className={`h-16 w-24 flex-none overflow-hidden rounded-md border md:h-20 md:w-32 ${local ? 'border-editorial-gold/80' : 'border-editorial-copper/50'}`}>
            <ColonyVideoTile participant={p} isLocal={local} compact />
          </div>
        );
      })}
    </div>
  );
}