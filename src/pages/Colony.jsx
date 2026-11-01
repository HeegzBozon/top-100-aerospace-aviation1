import React, { useState, useEffect, useCallback, useRef } from 'react';
import Daily from '@daily-co/daily-js';
import { useNavigate } from 'react-router-dom';
import { colonyRoom } from '@/functions/colonyRoom';
import ColonyLobby from '@/components/colony/ColonyLobby';
import ColonyHUD from '@/components/colony/ColonyHUD';
import ColonyVideoTile from '@/components/colony/ColonyVideoTile';
import ColonyParticipantList from '@/components/colony/ColonyParticipantList';
import ColonyGameCanvas from '@/components/colony/ColonyGameCanvas';
import ColonyZoneCard from '@/components/colony/ColonyZoneCard';
import { COLONY_ROOMS } from '@/components/colony/colonyZones';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';

// ─── Video thumbnail overlay ───────────────────────────────────────────────────
function VideoThumbnailOverlay({ participants, localSessionId }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!participants.length) return null;

  // Show local first, then remotes
  const ordered = [
    ...participants.filter(p => p.session_id === localSessionId),
    ...participants.filter(p => p.session_id !== localSessionId),
  ];

  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
      <button
        onClick={() => setExpanded(v => !v)}
        aria-label={expanded ? 'Collapse video' : 'Expand video'}
        className="self-end flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 text-slate-300 text-xs hover:bg-slate-700/80 transition-colors"
      >
        {expanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        {expanded ? 'Collapse' : 'Expand'}
      </button>
      <div className={`flex flex-col gap-2 ${expanded ? 'w-56' : 'w-32'}`}>
        {(expanded ? ordered : ordered.slice(0, 1)).map(p => (
          <div key={p.session_id} className="rounded-xl overflow-hidden shadow-lg border border-slate-700">
            <ColonyVideoTile
              participant={p}
              isLocal={p.session_id === localSessionId}
            />
          </div>
        ))}
        {!expanded && ordered.length > 1 && (
          <div className="text-center text-xs text-slate-400 bg-slate-800/70 rounded-lg py-1">
            +{ordered.length - 1} more
          </div>
        )}
      </div>
    </div>
  );
}

export default function Colony() {
  const callRef = useRef(null);
  const navigate = useNavigate();
  const [callState, setCallState] = useState('lobby'); // lobby | joining | joined | error
  const [participants, setParticipants] = useState({});
  const [localSessionId, setLocalSessionId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [positions, setPositions] = useState({});
  const [zone, setZone] = useState(null);
  const [room, setRoom] = useState('hall');
  const myPosRef = useRef(null);

  // Every step is broadcast to the room; a newcomer is told where we stand.
  const sendPos = useCallback((to = '*') => {
    if (callRef.current && myPosRef.current) callRef.current.sendAppMessage({ type: 'pos', ...myPosRef.current }, to);
  }, []);
  const handleMove = useCallback((col, row) => {
    myPosRef.current = { col, row };
    sendPos();
  }, [sendPos]);

  const syncParticipants = useCallback(() => {
    if (!callRef.current) return;
    const ps = callRef.current.participants();
    setParticipants({ ...ps });
    setLocalSessionId(ps?.local?.session_id || null);
  }, []);

  const handleLeave = useCallback(async () => {
    if (callRef.current) {
      await callRef.current.leave();
      await callRef.current.destroy();
      callRef.current = null;
    }
    navigate('/app-store');
    setParticipants({});
    setLocalSessionId(null);
    setShowParticipants(false);
  }, []);

  const handleJoin = useCallback(async (roomName) => {
    setCallState('joining');
    setErrorMsg('');

    try {
    const res = await colonyRoom({ action: 'get_or_create_room', roomName });
    const { room, token } = res.data;

    const call = Daily.createCallObject({
      audioSource: true,
      videoSource: true,
    });
    callRef.current = call;

    const SYNC_EVENTS = [
      'joined-meeting',
      'participant-joined',
      'participant-updated',
      'participant-left',
      'track-started',
      'track-stopped',
    ];
    SYNC_EVENTS.forEach((evt) => call.on(evt, syncParticipants));

    call.on('app-message', (e) => {
      if (e?.data?.type === 'pos') setPositions(prev => ({ ...prev, [e.fromId]: { col: e.data.col, row: e.data.row } }));
    });
    call.on('participant-joined', (e) => sendPos(e.participant.session_id));
    call.on('participant-left', (e) => setPositions(prev => {
      const next = { ...prev }; delete next[e.participant.session_id]; return next;
    }));

    call.on('error', (e) => {
      setErrorMsg(e?.errorMsg || 'An error occurred.');
      setCallState('error');
    });

    await call.join({ url: room.url, token });
    setCallState('joined');
    syncParticipants();
    sendPos();
    } catch (e) {
      callRef.current?.destroy();
      callRef.current = null;
      setErrorMsg(e?.errorMsg || e?.message || 'Could not enter the space. Check camera and microphone access.');
      setCallState('error');
    }
  }, [syncParticipants, sendPos]);

  const handleToggleMic = useCallback(() => {
    if (!callRef.current) return;
    callRef.current.setLocalAudio(isMuted);
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  const handleToggleCam = useCallback(() => {
    if (!callRef.current) return;
    callRef.current.setLocalVideo(isCamOff);
    setIsCamOff((prev) => !prev);
  }, [isCamOff]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (callRef.current) {
        callRef.current.leave().catch(() => {}).finally(() => {
          callRef.current?.destroy();
          callRef.current = null;
        });
      }
    };
  }, []);

  // Everyone drops straight into the main hall.
  useEffect(() => {
    if (callState === 'lobby') handleJoin('colony-main');
  }, [callState, handleJoin]);

  const participantList = Object.values(participants);

  if (callState === 'joining' || callState === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-slate-400 text-sm">Entering Colony…</p>
      </div>
    );
  }

  if (callState === 'error') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 p-4">
        <p className="text-red-400 text-sm text-center">{errorMsg || 'Something went wrong.'}</p>
        <button
          onClick={() => setCallState('lobby')}
          className="text-indigo-400 underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="hh-slide-window md:h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-white font-semibold text-sm">Colony</span>
        </div>
        <span className="text-slate-400 text-xs">{participantList.length} in space</span>
      </header>

      {/* World Canvas — fills remaining height */}
      <main
        className={`flex-1 relative overflow-hidden min-h-0 ${showParticipants ? 'mr-72' : ''}`}
        aria-label="Colony world"
      >
        <ColonyGameCanvas
          sprites={participantList.filter(p => p.session_id !== localSessionId)}
          key={room}
          mapUrl={COLONY_ROOMS[room].map}
          zones={COLONY_ROOMS[room].zones}
          localSessionId={localSessionId}
          positions={positions}
          onMove={handleMove}
          onZoneChange={setZone}
        />

        <ColonyZoneCard zone={zone} onEnterRoom={(r) => { setZone(null); setRoom(r); }} />

        {/* Video thumbnail — bottom-right corner */}
        <VideoThumbnailOverlay
          participants={participantList}
          localSessionId={localSessionId}
        />
      </main>

      {/* HUD */}
      <ColonyHUD
        isMuted={isMuted}
        isCamOff={isCamOff}
        onToggleMic={handleToggleMic}
        onToggleCam={handleToggleCam}
        onLeave={handleLeave}
        participantCount={participantList.length}
        onToggleParticipants={() => setShowParticipants((prev) => !prev)}
      />

      {/* Participant Sidebar */}
      {showParticipants && (
        <ColonyParticipantList
          participants={participantList}
          localSessionId={localSessionId}
          onClose={() => setShowParticipants(false)}
        />
      )}
    </div>
  );
}