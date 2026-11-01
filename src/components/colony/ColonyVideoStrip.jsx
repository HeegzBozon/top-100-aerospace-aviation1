import { Mic } from 'lucide-react';
import ColonyVideoTile from '@/components/colony/ColonyVideoTile';

const live = (p, kind) => {
  const t = p?.tracks?.[kind];
  return !!t?.persistentTrack && t.state !== 'off' && t.state !== 'interrupted';
};

// The room's faces, sized to what is live: a reel of tiles when anyone's camera is on,
// a slim bar of speakers when there is only voice, and nothing when the room is silent.
export default function ColonyVideoStrip({ participants, localSessionId }) {
  const ordered = [
    ...participants.filter(p => p.session_id === localSessionId),
    ...participants.filter(p => p.session_id !== localSessionId),
  ];
  if (!ordered.length) return null;
  const anyVideo = ordered.some(p => live(p, 'video'));
  const voices = ordered.filter(p => live(p, 'audio'));

  if (anyVideo) {
    return (
      <div className="flex gap-2 overflow-x-auto px-2 pb-2 pt-2 scrollbar-hide">
        {ordered.map(p => {
          const local = p.session_id === localSessionId;
          return (
            <div key={p.session_id} className={`h-16 w-24 flex-none overflow-hidden rounded-md border shadow-[0_4px_12px_rgba(3,6,13,0.55)] md:h-20 md:w-32 ${local ? 'border-editorial-gold/80' : 'border-editorial-copper/50'}`}>
              <ColonyVideoTile participant={p} isLocal={local} compact />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      {/* Tiles stay mounted out of sight so remote voices keep playing. */}
      <div className="hidden">
        {ordered.filter(p => p.session_id !== localSessionId).map(p => (
          <ColonyVideoTile key={p.session_id} participant={p} compact />
        ))}
      </div>
      {voices.length > 0 && (
        <div className="mx-2 mt-2 flex items-center gap-2 overflow-x-auto rounded-full border border-editorial-copper/50 bg-editorial-navy/90 px-3 py-1 scrollbar-hide">
          <Mic className="h-3 w-3 flex-none text-editorial-gold" />
          {voices.map(p => (
            <span key={p.session_id} className="flex-none font-body text-[11px] text-editorial-cream">
              {p.session_id === localSessionId ? 'You' : (p.user_name || 'Guest')}
            </span>
          ))}
        </div>
      )}
    </>
  );
}