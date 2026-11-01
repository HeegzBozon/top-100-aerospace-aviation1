import React, { useState, useEffect, useCallback, useRef } from 'react';
import Daily from '@daily-co/daily-js';
import { useNavigate } from 'react-router-dom';
import { colonyRoom } from '@/functions/colonyRoom';
import ColonyLobby from '@/components/colony/ColonyLobby';
import ColonySplash from '@/components/colony/ColonySplash';
import ColonyIntro from '@/components/colony/ColonyIntro';
import ColonyGuestGate from '@/components/colony/ColonyGuestGate';
import ColonyHUD from '@/components/colony/ColonyHUD';
import ColonyVideoTile from '@/components/colony/ColonyVideoTile';
import ColonyParticipantList from '@/components/colony/ColonyParticipantList';
import ColonyGameCanvas from '@/components/colony/ColonyGameCanvas';
import ColonyZoneCard from '@/components/colony/ColonyZoneCard';
import useColonyGamepad from '@/components/colony/useColonyGamepad';
import ColonyDirectory from '@/components/colony/ColonyDirectory';
import ColonyChat from '@/components/colony/ColonyChat';
import ColonyConcierge from '@/components/colony/ColonyConcierge';
import { COLONY_ROOMS } from '@/components/colony/colonyZones';
import ColonyVideoStrip from '@/components/colony/ColonyVideoStrip';
import useColonyMenus from '@/components/colony/useColonyMenus';
import { registerPicker } from '@/components/handheld/handheldPicker';
import ColonyAvatarPicker from '@/components/colony/ColonyAvatarPicker';
import { DEFAULT_AVATAR, cleanAvatar } from '@/components/colony/colonyAvatar';
import { base44 } from '@/api/base44Client';
import { Loader2, Shirt } from 'lucide-react';

const WHEEL_PRINTS = { up: '▲', left: '◀', right: '▶', down: '▼' };

export default function Colony() {
  const [access, setAccess] = useState('checking');
  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      if (ok) sessionStorage.removeItem('colony-guest-name');
      setAccess(ok || sessionStorage.getItem('colony-guest-name') ? 'in' : 'gate');
    });
  }, []);
  return (
    <>
      {access === 'in' && <ColonyRoom />}
      {access === 'gate' && <ColonyGuestGate onGuest={() => setAccess('in')} />}
      {access === 'checking' && <ColonySplash />}
      <ColonyIntro />
    </>
  );
}

function ColonyRoom() {
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
  const [room, setRoom] = useState('lobby');
  const myPosRef = useRef(null);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [showAvatar, setShowAvatar] = useState(false);
  // The click wheel, held as a joystick: the zone under the thumb is the way you walk.
  const stickRef = useRef({});
  const zoneRef = useRef(null);
  zoneRef.current = zone;
  const [panel, setPanel] = useState(null); // directory | chat | concierge
  const [myCell, setMyCell] = useState(null);
  const [chat, setChat] = useState([]);
  const [mediaError, setMediaError] = useState('');

  // Browsers hold back sound until the visitor touches the page; the first tap releases it.
  useEffect(() => {
    const unlock = () => document.querySelectorAll('audio, video').forEach((el) => el.play().catch(() => {}));
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, []);
  const retryMedia = () => {
    setMediaError('');
    callRef.current?.startCamera?.().then(() => {
      callRef.current.setLocalAudio(true); callRef.current.setLocalVideo(true);
      setIsMuted(false); setIsCamOff(false);
    }).catch(() => setMediaError('Still blocked. Check your browser and device permissions for this site.'));
  };

  const activateZone = useCallback((z) => {
    if (!z) return false;
    if (z.panel) { setPanel(z.panel); return true; }
    setZone(null);
    if (z.room) setRoom(z.room); else navigate(z.to);
    return true;
  }, [navigate]);

  // Enter on a keyboard walks through the door too (unless typing in a field).
  useEffect(() => {
    if (callState !== 'joined') return undefined;
    const onKey = (e) => {
      if (e.key !== 'Enter' || panel) return;
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;
      if (activateZone(zoneRef.current)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [callState, panel, activateZone]);

  const sendChat = useCallback((text) => {
    const name = callRef.current?.participants()?.local?.user_name || 'Member';
    const id = `${Date.now()}-${Math.random()}`;
    callRef.current?.sendAppMessage({ type: 'chat', id, text, name }, '*');
    setChat(prev => [...prev, { id, text, name, mine: true }].slice(-100));
  }, []);

  useEffect(() => {
    if (callState !== 'joined') return undefined;
    return registerPicker({
      labels: () => [],
      index: () => 0,
      goTo: () => null,
      step: () => true,
      page: () => null,
      // The centre walks through the door you are standing at.
      enter: () => {
        return activateZone(zoneRef.current);
      },
      back: () => {
        if (panel) { setPanel(null); return true; }
        if (roomRef.current === 'lobby') return false;
        setZone(null); setRoom(roomRef.current === 'hall' ? 'lobby' : 'hall');
        return true;
      },
      steer: {
        prints: WHEEL_PRINTS,
        hold: (dir, on) => { stickRef.current[dir] = on; },
      },
    });
  }, [callState, activateZone, panel]);

  useColonyGamepad(stickRef, {
    enter: () => activateZone(zoneRef.current),
    back: () => {
      if (panel) return setPanel(null);
      if (roomRef.current === 'lobby') return;
      setZone(null); setRoom(roomRef.current === 'hall' ? 'lobby' : 'hall');
    },
  }, callState === 'joined');

  // Every step is broadcast to the room; a newcomer is told where we stand.
  const sendPos = useCallback((to = '*') => {
    if (callRef.current && myPosRef.current) callRef.current.sendAppMessage({ type: 'pos', ...myPosRef.current }, to);
  }, []);
  const roomRef = useRef('lobby');
  roomRef.current = room;
  const avatarRef = useRef(DEFAULT_AVATAR);
  avatarRef.current = avatar;
  useEffect(() => {
    base44.auth.me().then(u => u?.colony_avatar && setAvatar(cleanAvatar(u.colony_avatar))).catch(() => {});
  }, []);
  const saveAvatar = useCallback(async (next) => {
    if (!sessionStorage.getItem('colony-guest-name')) await base44.auth.updateMe({ colony_avatar: next });
    setAvatar(next);
    if (myPosRef.current) { myPosRef.current = { ...myPosRef.current, avatar: next }; sendPos(); }
  }, [sendPos]);
  const handleMove = useCallback((col, row, facing) => {
    myPosRef.current = { col, row, facing, room: roomRef.current, avatar: avatarRef.current };
    setMyCell({ col, row, room: roomRef.current });
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
    const guestName = sessionStorage.getItem('colony-guest-name') || undefined;
    const res = await colonyRoom({ action: 'get_or_create_room', roomName, guestName });
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
      if (e?.data?.type === 'pos') setPositions(prev => ({ ...prev, [e.fromId]: { col: e.data.col, row: e.data.row, room: e.data.room || 'lobby', facing: e.data.facing, avatar: e.data.avatar } }));
      if (e?.data?.type === 'chat' && typeof e.data.text === 'string') {
        setChat(prev => [...prev, { id: e.data.id, text: e.data.text.slice(0, 500), name: String(e.data.name || 'Member').slice(0, 60) }].slice(-100));
      }
    });
    call.on('participant-joined', (e) => sendPos(e.participant.session_id));
    call.on('participant-left', (e) => setPositions(prev => {
      const next = { ...prev }; delete next[e.participant.session_id]; return next;
    }));

    // Browser or device refused the camera/mic: say so instead of failing silently.
    call.on('camera-error', (e) => {
      setMediaError(e?.error?.msg || e?.errorMsg?.errorMsg || 'Camera or microphone is blocked. Allow access in your browser settings, then tap Retry.');
    });
    call.on('started-camera', () => setMediaError(''));

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

  useColonyMenus({
    room,
    setRoom: (r) => { setPanel(null); setZone(null); setRoom(r); },
    openPanel: (p) => { setShowAvatar(false); setPanel(p); },
    toggleParticipants: () => setShowParticipants(v => !v),
    toggleAvatar: () => { setPanel(null); setShowAvatar(v => !v); },
    isMuted,
    toggleMic: handleToggleMic,
    isCamOff,
    toggleCam: handleToggleCam,
    leave: handleLeave,
    participantCount: Object.keys(participants).length,
  });

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
  // Video is proximity based: you see and hear only people standing near you in the same room.
  // At the concierge desk the channel is private, so only you are on the reel.
  const NEAR = 8;
  // The concierge desk carries no video at all.
  const nearby = panel === 'concierge' ? [] : participantList.filter(p => {
    if (p.session_id === localSessionId) return true;
    if (!myCell) return false;
    const pos = positions[p.session_id];
    // Someone whose position hasn't arrived yet is still heard and seen.
    if (!pos) return true;
    return pos.room === myCell.room && Math.hypot(pos.col - myCell.col, pos.row - myCell.row) <= NEAR;
  });

  if (callState === 'joining' || callState === 'lobby') {
    return <ColonySplash />;
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
    <div className="hh-slide-window md:h-screen bg-slate-950 relative flex flex-col overflow-hidden">
      {/* Header */}
      {/* Room, character and campus moves live in the menu bar's File and Edit menus now */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 [&>*]:pointer-events-auto [&>*]:bg-transparent">
        <ColonyVideoStrip participants={nearby} localSessionId={localSessionId} />
      </div>

      {/* World Canvas — fills remaining height */}
      <main
        className={`flex-1 relative overflow-hidden min-h-0 ${showParticipants ? 'mr-72' : ''}`}
        aria-label="Colony world"
      >
        <ColonyGameCanvas
          sprites={participantList.filter(p => p.session_id !== localSessionId)}
          key={room}
          room={room}
          mapUrl={COLONY_ROOMS[room].map}
          zones={COLONY_ROOMS[room].zones}
          start={COLONY_ROOMS[room].start}
          localSessionId={localSessionId}
          positions={positions}
          onMove={handleMove}
          onZoneChange={setZone}
          stickRef={stickRef}
          myAvatar={avatar}
        />
        {showAvatar && <ColonyAvatarPicker avatar={avatar} onSave={saveAvatar} onClose={() => setShowAvatar(false)} />}

        {!panel && <ColonyZoneCard zone={zone} onActivate={activateZone} />}
        {mediaError && (
          <div className="absolute left-3 right-3 top-24 z-30 mx-auto flex max-w-md items-center gap-2 rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 px-3 py-2 text-xs text-editorial-cream">
            <span className="flex-1">{mediaError}</span>
            <button type="button" onClick={retryMedia} className="rounded bg-editorial-copper px-2.5 py-1 font-semibold">Retry</button>
          </div>
        )}
        {panel === 'directory' && (
          <ColonyDirectory current={room} onClose={() => setPanel(null)} onGo={(r) => { setPanel(null); setZone(null); setRoom(r); }} />
        )}
        {panel === 'concierge' && <ColonyConcierge onClose={() => setPanel(null)} />}
        {panel === 'chat' && <ColonyChat messages={chat} onSend={sendChat} onClose={() => setPanel(null)} />}

      </main>

      {/* HUD */}
      {/* Put away while a panel with a field is open, so its input is never covered */}
      {!panel && <ColonyHUD
        isMuted={isMuted}
        isCamOff={isCamOff}
        onToggleMic={handleToggleMic}
        onToggleCam={handleToggleCam}
        onLeave={handleLeave}
        participantCount={participantList.length}
        onToggleParticipants={() => setShowParticipants((prev) => !prev)}
      />}

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