import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import ColonyTheatrePanel from '@/components/colony/ColonyTheatrePanel';
import ColonyArcadePanel from '@/components/colony/ColonyArcadePanel';
import SponsorLoungePanel from '@/components/sponsor-lounge/SponsorLoungePanel';
import ColonyConcierge from '@/components/colony/ColonyConcierge';
import { buildBrief, briefSummary, coachingFor } from '@/components/colony/campusBrief';
import RoomSplash from '@/components/colony/RoomSplash';
import CampusSky from '@/components/colony/CampusSky';
import QuestCelebration from '@/components/colony/quests/QuestCelebration';
import { loadMissingFields } from '@/components/colony/conciergeDiscovery';
import { COLONY_ROOMS } from '@/components/colony/colonyZones';
import ColonyVideoStrip from '@/components/colony/ColonyVideoStrip';
import { canHear, areaAt } from '@/components/colony/colonyAudio';
import ColonyAreaChip from '@/components/colony/ColonyAreaChip';
import StarAtlasPanel from '@/components/star-atlas/StarAtlasPanel';
import HonoreeExhibit from '@/components/colony/HonoreeExhibit';
import useHonoreeExhibits from '@/components/colony/useHonoreeExhibits';
import ColonyOnboarding from '@/components/colony/ColonyOnboarding';
// Daily throws an invalid-state error when a call is used before it has joined or after it is left.
const inCall = (c) => { try { return c?.meetingState?.() === 'joined-meeting'; } catch { return false; } };
import ColonyMapEditor from '@/components/colony/ColonyMapEditor';
import ColonyNpcDialogue from '@/components/colony/ColonyNpcDialogue';
import ColonyPersonCard from '@/components/colony/ColonyPersonCard';
import ColonyNearbyBar from '@/components/colony/ColonyNearbyBar';
import ColonyPassport from '@/components/colony/quests/ColonyPassport';
import ColonyQuestTracker from '@/components/colony/quests/ColonyQuestTracker';
import { useColonyMusic } from '@/components/colony/colonyMusic';
import { playStampSfx } from '@/components/colony/colonySfx';
import ColonyQuestStep from '@/components/colony/quests/ColonyQuestStep';
import ColonyReconcile from '@/components/colony/quests/ColonyReconcile';
import usePassport, { restoreFromLink } from '@/components/colony/quests/usePassport';
import { loadLocal } from '@/components/colony/quests/passportStore';
import { questFor, lockReason } from '@/components/colony/quests/firstFlight';
import { discoveryFor } from '@/components/colony/quests/discovery';
import ColonyCastEditor from '@/components/colony/ColonyCastEditor';
import useColonyCast from '@/components/colony/useColonyCast';
import useColonyWalls from '@/components/colony/useColonyWalls';
import useColonyMenus from '@/components/colony/useColonyMenus';
import { registerPicker } from '@/components/handheld/handheldPicker';
import ColonyAvatarPicker from '@/components/colony/ColonyAvatarPicker';
import { DEFAULT_AVATAR, cleanAvatar, randomGuestAvatar, guestAvatarPrompt } from '@/components/colony/colonyAvatar';
import { base44 } from '@/api/base44Client';
import ColonyOnline from '@/components/colony/ColonyOnline';
import { setMenuBarStatus } from '@/components/shell/menuBarStatus';
import { Loader2, Shirt } from 'lucide-react';

// Panels that take the wheel, pad and arrow keys for themselves while open.
// Panels that take the controls themselves while they are open. The Arcade is one: its
// cabinets read the same keys the wheel would otherwise walk with.
const LIST_PANELS = ['directory', 'online', 'npc', 'person', 'quest', 'passport', 'arcade', 'sponsor-lounge'];
const WHEEL_PRINTS = { up: '▲', left: '◀', right: '▶', down: '▼' };

export default function Colony() {
  const [access, setAccess] = useState('checking');
  const [restoreError, setRestoreError] = useState('');
  useEffect(() => {
    (async () => {
      // A private save link: restore that passport onto this device first.
      const token = new URLSearchParams(window.location.search).get('save');
      if (token) {
        await restoreFromLink(token).catch(() => setRestoreError('That save link could not be found. Starting fresh.'));
        window.history.replaceState(null, '', window.location.pathname);
      }
      return base44.auth.isAuthenticated();
    })().then(async (ok) => {
      if (ok) {
        sessionStorage.removeItem('colony-guest-name');
        const u = await base44.auth.me();
        setMember(u);
        setAccess(u?.colony_avatar ? 'in' : 'onboard');
        return;
      }
      // A returning guest: their passport on this device carries their name and character.
      const local = loadLocal();
      if (!sessionStorage.getItem('colony-guest-name') && local?.name && local?.avatar) {
        sessionStorage.setItem('colony-guest-name', local.name);
        sessionStorage.setItem('colony-guest-avatar', JSON.stringify(local.avatar));
      }
      const g = sessionStorage.getItem('colony-guest-name') && sessionStorage.getItem('colony-guest-avatar');
      setAccess(g ? 'in' : 'gate');
    });
  }, []);
  const [member, setMember] = useState(null);
  return (
    <>
      {access === 'in' && <ColonyRoom onReplayWelcome={() => setAccess('onboard')} />}
      {access === 'onboard' && <ColonyOnboarding isGuest={!member} memberName={member?.full_name} onDone={() => setAccess('in')} />}
      {access === 'gate' && <ColonyGuestGate onGuest={() => setAccess('onboard')} />}
      {access === 'checking' && <ColonySplash />}
      {restoreError && access !== 'checking' && (
        <button type="button" onClick={() => setRestoreError('')} className="fixed inset-x-4 top-16 z-50 mx-auto max-w-sm rounded bg-editorial-navy px-3 py-2 text-xs text-editorial-cream ring-1 ring-editorial-copper">{restoreError} ✕</button>
      )}
      <ColonyIntro />
    </>
  );
}

function ColonyRoom({ onReplayWelcome }) {
  const castState = useColonyCast();
  const [npcId, setNpcId] = useState(null);
  const [personName, setPersonName] = useState('');
  const callRef = useRef(null);
  const navigate = useNavigate();
  const [callState, setCallState] = useState('lobby'); // lobby | joining | joined | error
  const [participants, setParticipants] = useState({});
  const [localSessionId, setLocalSessionId] = useState(null);
  // Voice and camera start off, and stay off until the visitor presses a key: a walk around
  // the campus never asks the browser for a device.
  const [isMuted, setIsMuted] = useState(true);
  const [isCamOff, setIsCamOff] = useState(true);
  // Carried across room changes, so a new room's call starts the way you left the last.
  const mutedRef = useRef(isMuted); mutedRef.current = isMuted;
  const camOffRef = useRef(isCamOff); camOffRef.current = isCamOff;
  const [showParticipants, setShowParticipants] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [positions, setPositions] = useState({});
  const [zone, setZone] = useState(null);
  // Pick up where you left off: the last room you stood in is remembered on this device.
  const [room, setRoom] = useState(() => {
    const asked = new URLSearchParams(window.location.search).get('room');
    if (asked && COLONY_ROOMS[asked]) return asked;
    const saved = localStorage.getItem('colony-room');
    return saved && COLONY_ROOMS[saved] ? saved : 'lobby';
  });
  useEffect(() => { localStorage.setItem('colony-room', room); }, [room]);
  const [zoom, setZoom] = useState(1);
  const joinedRoomRef = useRef(null);
  // Which copy of a full room you were placed in (1 = the room itself).
  const [roomCopy, setRoomCopy] = useState(1);
  // The room just left, so the next room spawns you in front of the door you came through.
  const fromRoomRef = useRef(null);
  const lastRoomRef = useRef(room);
  if (lastRoomRef.current !== room) { fromRoomRef.current = lastRoomRef.current; lastRoomRef.current = room; }
  const myPosRef = useRef(null);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [showAvatar, setShowAvatar] = useState(false);
  // The click wheel, held as a joystick: the zone under the thumb is the way you walk.
  const stickRef = useRef({});
  const zoneRef = useRef(null);
  zoneRef.current = zone;
  // Returning from a Sponsor Lounge checkout opens the desk that sold, with the receipt
  // acknowledged inside it (see SponsorLoungePanel).
  const [panel, setPanel] = useState(() =>
    new URLSearchParams(window.location.search).get('paid') === '1' ? 'sponsor-lounge' : null
  ); // directory | chat | concierge | theatre | arcade | editor | sponsor-lounge
  // Which cabinet was walked up to, when the Arcade is the panel that opened.
  const [cabinet, setCabinet] = useState(null);
  // Which lounge was walked up to, when a sponsor lounge is the panel that opened.
  const [loungeKey, setLoungeKey] = useState(() =>
    new URLSearchParams(window.location.search).get('paid') === '1' ? 'networking' : null
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [me, setMe] = useState(undefined);
  const pp = usePassport(me);
  const isGuest = me === null;
  const roomWalls = useColonyWalls(room);
  const meEmailRef = useRef(null);
  const exhibits = useHonoreeExhibits(room, castState.cast);
  const roomCast = [...castState.cast.filter(c => c.room === room && c.visibility === 'active'), ...exhibits];
  const roomZones = [
    ...COLONY_ROOMS[room].zones,
    ...roomCast.map(c => ({ key: `npc-${c.id}`, npc: c.id, label: c.honoree ? `Meet ${c.name}` : `Talk to ${c.name} · ${c.role}`, panel: 'npc', col: c.col - 1, row: c.row - 1, w: 3, h: 3 })),
  ];
  const activeNpc = castState.cast.find(c => c.id === npcId) || exhibits.find(c => c.id === npcId);
  const activeQuest = activeNpc && pp.passport ? questFor(activeNpc.id, pp.passport) : null;
  const openPassport = useCallback(() => setPanel('passport'), []);
  const [missingFields, setMissingFields] = useState([]);
  const [celebrate, setCelebrate] = useState(null);
  useEffect(() => { loadMissingFields(me?.email).then(setMissingFields); }, [me]);
  const brief = useMemo(() => pp.passport ? buildBrief(pp.passport, missingFields) : null, [pp.passport, missingFields]);
  useColonyMusic(room, (panel === 'npc' || panel === 'quest') && activeNpc ? activeNpc.id : null);
  const [myCell, setMyCell] = useState(null);
  const [chat, setChat] = useState([]);
  const [mediaError, setMediaError] = useState('');
  // Notices clear themselves after a few seconds.
  useEffect(() => {
    if (!mediaError) return undefined;
    const t = setTimeout(() => setMediaError(''), 8000);
    return () => clearTimeout(t);
  }, [mediaError]);

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
    }).catch(() => setMediaError('Still blocked by your browser — nothing is being shared. You can keep exploring with voice and camera off.'));
  };

  const activateZone = useCallback((z) => {
    if (!z) return false;
    if (z.npc) { setNpcId(z.npc); setPanel('npc'); return true; }
    if (z.replay) { onReplayWelcome(); return true; }
    if (z.panel) { setCabinet(z.cabinet || null); setLoungeKey(z.lounge || null); setPanel(z.panel); return true; }
    setZone(null);
    if (z.room) setRoom(z.room); else navigate(z.to);
    return true;
  }, [navigate, onReplayWelcome]);

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
    inCall(callRef.current) && callRef.current.sendAppMessage({ type: 'chat', id, text, name }, '*');
    setChat(prev => [...prev, { id, text, name, mine: true }].slice(-100));
  }, []);

  useEffect(() => {
    // A list panel (directory, online) takes the wheel itself while it is open.
    if (callState !== 'joined' || LIST_PANELS.includes(panel)) return undefined;
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
    voice: () => handleToggleMic(),
    video: () => handleToggleCam(),
    back: () => {
      if (panel) return setPanel(null);
      if (roomRef.current === 'lobby') return;
      setZone(null); setRoom(roomRef.current === 'hall' ? 'lobby' : 'hall');
    },
  }, callState === 'joined' && !LIST_PANELS.includes(panel));

  // Every step is broadcast to the room; a newcomer is told where we stand.
  const sendPos = useCallback((to = '*') => {
    if (inCall(callRef.current) && myPosRef.current) callRef.current.sendAppMessage({ type: 'pos', ...myPosRef.current }, to);
  }, []);
  const roomRef = useRef('lobby');
  roomRef.current = room;
  const avatarRef = useRef(DEFAULT_AVATAR);
  avatarRef.current = avatar;
  useEffect(() => {
    // First visit (member or guest) with no avatar yet: open the maker straight away.
    const guestAvatar = sessionStorage.getItem('colony-guest-avatar');
    if (sessionStorage.getItem('colony-guest-name')) {
      setMe(null);
      if (guestAvatar) { setAvatar(cleanAvatar(JSON.parse(guestAvatar))); return; }
      // A guest walks as a mascot from the kit — drawn at once, nothing generated and nothing
      // spent. A portrait is theirs to ask for, from the character panel.
      const kit = randomGuestAvatar();
      setAvatar(cleanAvatar(kit));
      return;
    }
    base44.auth.me().then(u => {
      setMe(u);
      setIsAdmin(u?.role === 'admin');
      meEmailRef.current = u?.email;
      if (u?.colony_avatar) setAvatar(cleanAvatar(u.colony_avatar));
      else setShowAvatar(true);
    }).catch(() => {});
  }, []);
  const saveAvatar = useCallback(async (next) => {
    if (!sessionStorage.getItem('colony-guest-name')) await base44.auth.updateMe({ colony_avatar: next });
    else { sessionStorage.setItem('colony-guest-avatar', JSON.stringify(next)); pp.update({ avatar: next }); }
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
    // Walking into another room hands you to that room's call: the old one is left
    // quietly, without returning to the splash.
    const switching = !!callRef.current;
    if (!switching) setCallState('joining');
    setErrorMsg('');
    joinedRoomRef.current = roomName;
    if (switching) {
      const old = callRef.current;
      callRef.current = null;
      await old.leave().catch(() => {});
      await old.destroy().catch(() => {});
      setParticipants({});
      setPositions({});
      setChat([]);
    }

    try {
    const guestName = sessionStorage.getItem('colony-guest-name') || undefined;
    const res = await colonyRoom({ action: 'get_or_create_room', roomName, guestName });
    const { room, token } = res.data;
    setRoomCopy(res.data.copy || 1);

    // No local device is opened when the room is joined: Daily is handed no audio or video
    // source, so entering a room raises no permission prompt. A track is only requested when
    // the visitor presses the microphone or the camera (see the HUD handlers).
    const call = Daily.createCallObject({
      audioSource: false,
      videoSource: false,
      // Only the people standing near you are streamed down (see the proximity effect).
      subscribeToTracksAutomatically: false,
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

    // Browser or device refused the camera/mic: say so in plain words, and say that nothing
    // is being shared. A visitor who declines simply keeps walking the campus.
    call.on('camera-error', (e) => {
      const raw = String(e?.error?.msg || e?.errorMsg?.errorMsg || '');
      const denied = /permission|notallowed|denied/i.test(raw);
      setMediaError(denied
        ? 'Your browser blocked the camera and microphone for this site — nothing is being shared. Allow access in your browser settings and press Retry, or leave them off and keep exploring.'
        : 'The camera or microphone could not start — nothing is being shared. You can keep exploring, or press Retry.');
    });
    call.on('started-camera', () => setMediaError(''));

    call.on('error', (e) => {
      setErrorMsg(e?.errorMsg || 'An error occurred.');
      setCallState('error');
    });

    await call.join({ url: room.url, token, startAudioOff: mutedRef.current, startVideoOff: camOffRef.current });
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
    if (inCall(callRef.current)) callRef.current.setLocalAudio(isMuted);
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  const handleToggleCam = useCallback(() => {
    if (inCall(callRef.current)) callRef.current.setLocalVideo(isCamOff);
    setIsCamOff((prev) => !prev);
  }, [isCamOff]);

  useColonyMenus({
    room,
    zoom,
    setZoom,
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
    isAdmin,
    openEditor: () => { setShowAvatar(false); setPanel('editor'); },
    openCastEditor: () => { setShowAvatar(false); setPanel('cast'); },
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

  // Everyone drops straight into the call of the room they stand in, and changes call
  // when they change room.
  const callNameFor = (r) => (r === 'lobby' ? 'colony-main' : `colony-${r}`);
  useEffect(() => {
    if (callState === 'lobby') handleJoin(callNameFor(room));
    else if (callState === 'joined' && joinedRoomRef.current !== callNameFor(room)) handleJoin(callNameFor(room));
  }, [callState, room, handleJoin]);

  const participantList = Object.values(participants);
  const onlineCount = participantList.length;
  useEffect(() => {
    if (callState !== 'joined') return undefined;
    return setMenuBarStatus({ count: onlineCount, onClick: () => { setShowAvatar(false); setPanel((p) => (p === 'online' ? null : 'online')); } });
  }, [callState, onlineCount]);
  // Video is proximity based: you see and hear only people standing near you in the same room.
  // At the concierge desk the channel is private, so only you are on the reel.
  // The concierge desk carries no video at all.
  const nearby = panel === 'concierge' ? [] : participantList.filter(p => {
    if (p.session_id === localSessionId) return true;
    if (!myCell) return false;
    const pos = positions[p.session_id];
    // Someone whose position hasn't arrived yet is still heard and seen.
    if (!pos) return true;
    return canHear(myCell, pos);
  });

  // Stream only the nearby people's audio and video; everyone else stays present on the
  // map but costs nothing to receive. This is what lets a room hold a crowd.
  const nearbyKey = nearby.map(p => p.session_id).sort().join(',');
  useEffect(() => {
    const call = callRef.current;
    if (!inCall(call) || callState !== 'joined') return;
    const near = new Set(nearbyKey.split(','));
    const updates = {};
    Object.values(call.participants()).forEach((p) => {
      if (p.local) return;
      updates[p.session_id] = { setSubscribedTracks: near.has(p.session_id) };
    });
    if (Object.keys(updates).length) call.updateParticipants(updates);
  }, [nearbyKey, participantList.length, callState]);

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
    <div className="hh-slide-window md:h-[calc(100%-41px)] bg-slate-950 relative flex flex-col overflow-hidden">
      {/* Header */}
      {/* Room, character and campus moves live in the menu bar's File and Edit menus now */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 [&>*]:pointer-events-auto [&>*]:bg-transparent">
        <ColonyAreaChip
          roomLabel={COLONY_ROOMS[room]?.label}
          copy={roomCopy}
          area={myCell ? areaAt(myCell.room, myCell.col, myCell.row) : null}
        />
      </div>

      {!panel && (
        <ColonyNearbyBar people={nearby.filter(p => p.session_id !== localSessionId)}
          onPick={(p) => { setPersonName(p.user_name || 'Participant'); setPanel('person'); }}
          onChat={() => setPanel('chat')} />
      )}
      {!panel && <ColonyQuestTracker passport={pp.passport} onOpen={openPassport} />}
      <div className={`absolute bottom-20 right-0 z-40 flex max-w-[70%] flex-col items-end [&>div]:pt-0 ${showParticipants ? 'md:right-72' : ''}`}>
        <ColonyVideoStrip participants={nearby} localSessionId={localSessionId} />
      </div>
      {room === 'hall' && <CampusSky />}
      <RoomSplash room={room} label={COLONY_ROOMS[room]?.label} />
      {celebrate && pp.passport && <QuestCelebration quest={celebrate} passport={pp.passport} onClose={() => setCelebrate(null)} />}
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
          zones={roomZones}
          npcs={roomCast}
          walls={roomWalls.walls}
          fromRoom={fromRoomRef.current}
          zoom={zoom}
          start={COLONY_ROOMS[room].start}
          localSessionId={localSessionId}
          positions={positions}
          onMove={handleMove}
          onZoneChange={setZone}
          onPlate={(id) => {
            setShowAvatar(false);
            if (id.startsWith('npc-')) { setNpcId(id.slice(4)); setPanel('npc'); return; }
            const p = participantList.find(x => x.session_id === id);
            if (p) { setPersonName(p.user_name || 'Participant'); setPanel('person'); }
          }}
          stickRef={stickRef}
          myAvatar={avatar}
        />
        {showAvatar && <ColonyAvatarPicker avatar={avatar} isGuest={!!sessionStorage.getItem('colony-guest-name')} onSave={saveAvatar} onClose={() => setShowAvatar(false)} />}

        {!panel && <ColonyZoneCard zone={zone} onActivate={activateZone} />}
        {mediaError && (
          <div className="absolute left-3 right-3 top-24 z-30 mx-auto flex max-w-md items-center gap-2 rounded-lg border border-editorial-copper/60 bg-editorial-navy/95 px-3 py-2 text-xs text-editorial-cream">
            <span className="flex-1">{mediaError}</span>
            <button type="button" onClick={retryMedia} className="rounded bg-editorial-copper px-2.5 py-1 font-semibold">Retry</button>
            <button type="button" onClick={() => setMediaError('')} aria-label="Dismiss" className="px-1 text-editorial-cream/70">✕</button>
          </div>
        )}
        {panel === 'directory' && (
          <ColonyDirectory current={room} onClose={() => setPanel(null)} onGo={(r) => { setPanel(null); setZone(null); setRoom(r); }} />
        )}
        {panel === 'online' && (
          <ColonyOnline participants={participantList} positions={positions} localSessionId={localSessionId} myRoom={room}
            onClose={() => setPanel(null)} onGo={(r) => { setPanel(null); setZone(null); setRoom(r); }} />
        )}
        {panel === 'concierge' && <ColonyConcierge onClose={() => setPanel(null)} />}
        {panel === 'person' && (
          <ColonyPersonCard name={personName} onClose={() => setPanel(null)}
            onGo={(to) => { setPanel(null); navigate(to); }} onChat={() => setPanel('chat')} />
        )}
        {pp.pendingGuest && <ColonyReconcile guest={pp.pendingGuest} onClaim={pp.claimGuest} onLeave={pp.leaveGuest} />}
        {panel === 'atlas' && <StarAtlasPanel passport={pp.passport} onSave={pp.update} onClose={() => setPanel(null)} />}
        {panel === 'passport' && (
          <ColonyPassport passport={pp.passport} isGuest={isGuest} onSave={pp.update} makeLink={pp.makeLink} onClose={() => setPanel(null)}
            onGo={(r) => { setPanel(null); setZone(null); setRoom(r); }} />
        )}
        {panel === 'quest' && activeQuest && activeNpc && (
          <ColonyQuestStep key={activeQuest.id} quest={activeQuest} npc={activeNpc} passport={pp.passport} onClose={() => setPanel('npc')}
            onComplete={(choice, i) => {
              pp.complete(activeQuest.id, choice);
              pp.discover(discoveryFor(activeQuest, choice));
              if (activeQuest.reward) playStampSfx();
              setCelebrate(activeQuest);
              setPanel(activeQuest.id === 'q01' ? 'passport' : null);
              if (activeQuest.rooms) { setZone(null); setRoom(activeQuest.rooms[i]); }
            }} />
        )}
        {panel === 'npc' && activeNpc?.honoree && (
          <HonoreeExhibit exhibit={activeNpc} passport={pp.passport} onSave={pp.update} onClose={() => setPanel(null)} />
        )}
        {panel === 'npc' && activeNpc && !activeNpc.honoree && (
          <ColonyNpcDialogue npc={activeNpc} onClose={() => setPanel(null)}
            quest={activeQuest && { title: activeQuest.title, lock: lockReason(pp.passport, activeQuest) }}
            onQuest={() => setPanel('quest')}
            coaching={(c => c?.action.panel === 'quest' && activeQuest?.act !== 5 ? null : c)(coachingFor(activeNpc.id, brief))}
            onAction={(a) => { setPanel(null); activateZone(a); }} />
        )}
        {panel === 'cast' && isAdmin && (
          <ColonyCastEditor cast={castState.cast} configs={castState.configs} onClose={() => setPanel(null)}
            onSave={(id, data) => castState.save(id, data, meEmailRef.current)} />
        )}
        {panel === 'editor' && isAdmin && (
          <ColonyMapEditor key={room} mapUrl={COLONY_ROOMS[room].map} label={COLONY_ROOMS[room].label} walls={roomWalls.walls}
            custom={roomWalls.custom} onSave={roomWalls.save} onReset={roomWalls.reset} onClose={() => setPanel(null)} />
        )}
        {panel === 'chat' && <ColonyChat messages={chat} onSend={sendChat} onClose={() => setPanel(null)} />}
        {panel === 'theatre' && <ColonyTheatrePanel onClose={() => setPanel(null)} />}
        {panel === 'arcade' && <ColonyArcadePanel initialCabinet={cabinet} onClose={() => setPanel(null)} />}
        {panel === 'sponsor-lounge' && (
          <SponsorLoungePanel
            lounge={loungeKey || 'summit'}
            isAdmin={isAdmin}
            onClose={() => setPanel(null)}
            onGoRoom={(r) => { setPanel(null); setZone(null); setRoom(r); }}
            onGo={(to) => { setPanel(null); navigate(to); }}
          />
        )}

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