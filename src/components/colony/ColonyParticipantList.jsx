import { Mic, MicOff, Video, VideoOff, X } from 'lucide-react';

function ParticipantRow({ participant, isLocal }) {
  const isMuted =
    !participant?.tracks?.audio?.subscribed ||
    participant?.tracks?.audio?.state === 'off';
  const isCamOff =
    !participant?.tracks?.video?.subscribed ||
    participant?.tracks?.video?.state === 'off';

  const displayName = participant?.user_name || 'Participant';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
        {initials}
      </div>
      <span className="flex-1 text-sm text-slate-200 truncate">
        {displayName}
        {isLocal && <span className="text-slate-500 ml-1 text-xs">(You)</span>}
      </span>
      <div className="flex items-center gap-1.5">
        {isMuted ? (
          <MicOff className="w-3.5 h-3.5 text-red-400" aria-label="Muted" />
        ) : (
          <Mic className="w-3.5 h-3.5 text-green-400" aria-label="Unmuted" />
        )}
        {isCamOff ? (
          <VideoOff className="w-3.5 h-3.5 text-red-400" aria-label="Camera off" />
        ) : (
          <Video className="w-3.5 h-3.5 text-green-400" aria-label="Camera on" />
        )}
      </div>
    </div>
  );
}

export default function ColonyParticipantList({ participants, localSessionId, onClose }) {
  return (
    <aside
      role="complementary"
      aria-label="Participants"
      className="fixed right-0 top-0 bottom-0 z-40 w-72 bg-slate-900 border-l border-slate-700 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h2 className="text-white font-semibold text-sm">
          Participants ({participants.length})
        </h2>
        <button
          onClick={onClose}
          aria-label="Close participant list"
          className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {participants.map((p) => (
          <ParticipantRow
            key={p.session_id}
            participant={p}
            isLocal={p.session_id === localSessionId}
          />
        ))}
      </div>
    </aside>
  );
}