import { Mic, MicOff, VideoOff } from 'lucide-react';
import ColonyVideoTile from '@/components/colony/ColonyVideoTile';

const live = (p, kind) => {
  const t = p?.tracks?.[kind];
  // Local tracks can report 'sendable' or 'loading' while the camera is live.
  return !!t?.persistentTrack && !['off', 'blocked', 'interrupted'].includes(t.state);
};

// The room's faces: a tile for everyone whose camera is on, and a slim chip for everyone
// else, so a muted, camera-off room shrinks to a thin bar but never disappears.
export default function ColonyVideoStrip({ participants, localSessionId }) {
  const ordered = [
    ...participants.filter(p => p.session_id === localSessionId),
    ...participants.filter(p => p.session_id !== localSessionId),
  ];
  if (!ordered.length) return null;
  const withVideo = ordered.filter(p => live(p, 'video'));
  const rest = ordered.filter(p => !live(p, 'video'));

  return (
    <div className="px-2 pt-2">
      {/* Off-screen tiles keep remote voices playing for people without video. */}
      <div className="hidden">
        {rest.filter(p => p.session_id !== localSessionId).map(p => <ColonyVideoTile key={p.session_id} participant={p} compact />)}
      </div>
      {withVideo.length > 0 && (
        <div className="mb-1.5 flex gap-2 overflow-x-auto scrollbar-hide">
          {withVideo.map(p => {
            const local = p.session_id === localSessionId;
            return (
              <div key={p.session_id} className={`h-16 w-24 flex-none overflow-hidden rounded-md border shadow-[0_4px_12px_rgba(3,6,13,0.55)] md:h-20 md:w-32 ${local ? 'border-editorial-gold/80' : 'border-editorial-copper/50'}`}>
                <ColonyVideoTile participant={p} isLocal={local} compact />
              </div>
            );
          })}
        </div>
      )}
      {rest.length > 0 && (
        <div className="flex w-fit max-w-full items-center gap-2 overflow-x-auto rounded-full border border-editorial-copper/40 bg-editorial-navy/80 px-2.5 py-0.5 opacity-80 scrollbar-hide">
          {rest.map(p => {
            const talking = live(p, 'audio');
            return (
              <span key={p.session_id} className="flex flex-none items-center gap-1 font-body text-[10px] text-editorial-cream">
                {talking ? <Mic className="h-2.5 w-2.5 text-editorial-gold" /> : <MicOff className="h-2.5 w-2.5 text-editorial-cream/50" />}
                <VideoOff className="h-2.5 w-2.5 text-editorial-cream/50" />
                {p.session_id === localSessionId ? 'You' : (p.user_name || 'Guest')}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}