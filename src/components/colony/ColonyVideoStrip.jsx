import ColonyVideoTile from '@/components/colony/ColonyVideoTile';

// The room's faces, carried in the top bar: you first, then everyone else, scrolling sideways.
export default function ColonyVideoStrip({ participants, localSessionId }) {
  const ordered = [
    ...participants.filter(p => p.session_id === localSessionId),
    ...participants.filter(p => p.session_id !== localSessionId),
  ];
  if (!ordered.length) return null;
  return (
    <div className="flex min-w-0 flex-1 justify-end gap-1.5 overflow-x-auto scrollbar-hide">
      {ordered.map(p => (
        <div key={p.session_id} className="h-10 w-14 flex-none overflow-hidden rounded-md border border-editorial-copper/40 md:h-12 md:w-16">
          <ColonyVideoTile participant={p} isLocal={p.session_id === localSessionId} compact />
        </div>
      ))}
    </div>
  );
}