import React, { useEffect, useRef } from 'react';
import { MicOff, VideoOff } from 'lucide-react';

export default function ColonyVideoTile({ participant, isLocal = false }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const videoTrack = participant?.tracks?.video?.persistentTrack;
  const audioTrack = participant?.tracks?.audio?.persistentTrack;
  const isMuted = !participant?.tracks?.audio?.subscribed || participant?.tracks?.audio?.state === 'off';
  const isCamOff = !participant?.tracks?.video?.subscribed || participant?.tracks?.video?.state === 'off';

  useEffect(() => {
    if (videoRef.current && videoTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
    }
  }, [videoTrack]);

  useEffect(() => {
    if (audioRef.current && audioTrack && !isLocal) {
      audioRef.current.srcObject = new MediaStream([audioTrack]);
    }
  }, [audioTrack, isLocal]);

  const displayName = participant?.user_name || 'Participant';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-video flex items-center justify-center">
      {/* Video Element */}
      {!isCamOff && videoTrack ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
          aria-label={`Video of ${displayName}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-900">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            {initials}
          </div>
        </div>
      )}

      {/* Audio Element (hidden) */}
      {!isLocal && <audio ref={audioRef} autoPlay playsInline aria-hidden="true" />}

      {/* Name + Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1 bg-slate-950/60">
        <span className="text-white text-xs font-medium truncate">
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