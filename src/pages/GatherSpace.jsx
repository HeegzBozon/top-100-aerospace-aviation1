import React, { useState, useEffect, useCallback, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { colonyRoom } from '@/functions/colonyRoom';
import ColonyLobby from '@/components/colony/ColonyLobby';
import ColonyHUD from '@/components/colony/ColonyHUD';
import ColonyVideoTile from '@/components/colony/ColonyVideoTile';
import ColonyParticipantList from '@/components/colony/ColonyParticipantList';
import { Loader2 } from 'lucide-react';

export default function GatherSpace() {
  const callRef = useRef(null);
  const [callState, setCallState] = useState('lobby'); // lobby | joining | joined | error
  const [participants, setParticipants] = useState({});
  const [localSessionId, setLocalSessionId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    setCallState('lobby');
    setParticipants({});
    setLocalSessionId(null);
    setShowParticipants(false);
  }, []);

  const handleJoin = useCallback(async (roomName) => {
    setCallState('joining');
    setErrorMsg('');

    const res = await colonyRoom({ action: 'get_or_create_room', roomName });
    const { room, token } = res.data;

    const call = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: true,
    });
    callRef.current = call;

    call.on('participant-joined', syncParticipants);
    call.on('participant-updated', syncParticipants);
    call.on('participant-left', syncParticipants);
    call.on('joined-meeting', syncParticipants);
    call.on('error', (e) => {
      setErrorMsg(e?.errorMsg || 'An error occurred.');
      setCallState('error');
    });

    await call.join({ url: room.url, token });
    setCallState('joined');
    syncParticipants();
  }, [syncParticipants]);

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
        callRef.current.destroy();
      }
    };
  }, []);

  const participantList = Object.values(participants);

  if (callState === 'lobby') {
    return <ColonyLobby onJoin={handleJoin} isLoading={false} />;
  }

  if (callState === 'joining') {
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
          Go back to lobby
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="text-white font-semibold text-sm">Colony</span>
        </div>
        <span className="text-slate-400 text-xs">{participantList.length} in space</span>
      </header>

      {/* Video Grid */}
      <main
        className={`flex-1 p-3 overflow-y-auto grid gap-3 ${showParticipants ? 'mr-72' : ''} ${
          participantList.length <= 1
            ? 'grid-cols-1'
            : participantList.length <= 4
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-2 sm:grid-cols-3'
        }`}
        aria-label="Video grid"
      >
        {participantList.map((p) => (
          <ColonyVideoTile
            key={p.session_id}
            participant={p}
            isLocal={p.session_id === localSessionId}
          />
        ))}
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

      {/* Bottom padding for HUD */}
      <div className="h-24" aria-hidden="true" />
    </div>
  );
}