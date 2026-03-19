import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ColonyHUD({
  isMuted,
  isCamOff,
  onToggleMic,
  onToggleCam,
  onLeave,
  participantCount,
  onToggleParticipants,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 p-4 bg-gradient-to-t from-slate-950/90 to-transparent">
      {/* Participant Count */}
      <button
        onClick={onToggleParticipants}
        aria-label="Toggle participant list"
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-800/80 text-slate-300 text-sm font-medium hover:bg-slate-700/80 transition-colors min-h-[44px]"
      >
        <Users className="w-4 h-4" />
        <span>{participantCount}</span>
      </button>

      {/* Mic Toggle */}
      <Button
        onClick={onToggleMic}
        aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        className={`rounded-full w-12 h-12 p-0 transition-colors ${
          isMuted
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-white'
        }`}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>

      {/* Camera Toggle */}
      <Button
        onClick={onToggleCam}
        aria-label={isCamOff ? 'Turn on camera' : 'Turn off camera'}
        className={`rounded-full w-12 h-12 p-0 transition-colors ${
          isCamOff
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-white'
        }`}
      >
        {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </Button>

      {/* Leave */}
      <Button
        onClick={onLeave}
        aria-label="Leave Colony"
        className="rounded-full w-12 h-12 p-0 bg-red-600 hover:bg-red-700 text-white"
      >
        <PhoneOff className="w-5 h-5" />
      </Button>
    </div>
  );
}