import { useEffect, useRef } from 'react';
import { MicOff, VideoOff } from 'lucide-react';

export default function ColonyVideoTile({ participant, isLocal = false, compact = false }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const videoTrack = participant?.tracks?.video?.persistentTrack;
  const audioTrack = participant?.tracks?.audio?.persistentTrack;

  // A track is "off" if it doesn't exist or its state is off/interrupted
  const videoState = participant?.tracks?.video?.state;
  const audioState = participant?.tracks?.audio?.state;
  const isCamOff = !videoTrack || videoState === 'off' || videoState === 'interrupted';
  const isMuted = !audioTrack || audioState === 'off' || audioState === 'interrupted';

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (videoTrack && !isCamOff) {
      el.srcObject = new MediaStream([videoTrack]);
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [videoTrack, isCamOff]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || isLocal) return;
    if (audioTrack && !isMuted) {
      el.srcObject = new MediaStream([audioTrack]);
      el.play().catch(() => {});
    } else {
      el.srcObject = null;
    }
  }, [audioTrack, isMuted, isLocal]);

  const displayName = participant?.user_name || 'Participant';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`relative overflow-hidden bg-editorial-navy flex items-center justify-center ${compact ? 'h-full w-full' : 'rounded-xl aspect-video'}`} title={displayName}>
      {/* Hidden audio element for remote participants */}
      {!isLocal && (
        <audio ref={audioRef} autoPlay aria-hidden="true" />
      )}

      {/* Video or avatar fallback */}
      {!isCamOff && videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          aria-label={`Video of ${displayName}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#14283f]">
          <div className={`rounded-full border border-editorial-gold/70 bg-editorial-navy flex items-center justify-center font-heading text-editorial-gold ${compact ? 'h-8 w-8 text-xs' : 'w-16 h-16 text-xl'}`}>
            {initials}
          </div>
        </div>
      )}

      {/* Name + Status Bar */}
      <div className={`absolute bottom-0 left-0 right-0 flex items-center justify-between bg-editorial-navy/75 ${compact ? 'px-1.5 py-0.5' : 'px-2 py-1'}`}>
        <span className={`text-editorial-cream font-medium truncate ${compact ? 'text-[9px]' : 'text-xs'}`}>
          {displayName}
          {isLocal && <span className="text-slate-400 ml-1">(You)</span>}
        </span>
        <div className="flex items-center gap-1">
          {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
          {isCamOff && <VideoOff className="w-3 h-3 text-red-400" />}
        </div>
      </div>
    </div>
  );
}