import { useEffect, useRef } from 'react';
import { Compass, MessageCircle, MessagesSquare, Users, Shirt, LogOut, MapPin, Mic, MicOff, Video, VideoOff, ZoomIn, ZoomOut, RotateCcw, Map } from 'lucide-react';
import { registerSurfaceFileGroups, registerSurfaceEditGroups } from '@/components/shell/surfaceFileMenu';
import { COLONY_ROOMS } from '@/components/colony/colonyZones';

// The Colony's own File and Edit menus, registered with the machine's menu bar while the
// campus is on the glass. File moves you around campus; Edit changes how you appear in it.
export default function useColonyMenus({ room, zoom, setZoom, setRoom, openPanel, toggleParticipants, toggleAvatar, isMuted, toggleMic, isCamOff, toggleCam, leave, participantCount, isAdmin, openEditor }) {
  const state = { room, zoom, setZoom, setRoom, openPanel, toggleParticipants, toggleAvatar, isMuted, toggleMic, isCamOff, toggleCam, leave, participantCount, isAdmin, openEditor };
  const ref = useRef(state);
  ref.current = state;

  useEffect(() => {
    const file = () => {
      const s = ref.current;
      const here = COLONY_ROOMS[s.room];
      return [
        {
          key: 'colony-campus', label: `Campus · ${here?.label || 'Colony'}`,
          items: [
            { key: 'colony-concierge', label: 'Ask the concierge', hint: 'Private, 1:1', icon: MessageCircle, onSelect: () => s.openPanel('concierge') },
            { key: 'colony-directory', label: 'Campus directory', hint: 'Jump to any room', icon: Compass, onSelect: () => s.openPanel('directory') },
            { key: 'colony-chat', label: 'Room chat', icon: MessagesSquare, onSelect: () => s.openPanel('chat') },
            { key: 'colony-people', label: "Who's here", hint: `${s.participantCount} in campus`, icon: Users, onSelect: s.toggleParticipants },
          ],
        },
        {
          key: 'colony-go', label: 'Go to',
          items: Object.entries(COLONY_ROOMS).filter(([k]) => k !== s.room).slice(0, 6).map(([k, r]) => ({
            key: `colony-go-${k}`, label: r.label, icon: MapPin, onSelect: () => s.setRoom(k),
          })),
        },
        { key: 'colony-exit', label: 'Session', items: [{ key: 'colony-leave', label: 'Leave Colony', icon: LogOut, onSelect: s.leave }] },
      ];
    };
    const edit = () => {
      const s = ref.current;
      return [{
        key: 'colony-me', label: 'You in Colony',
        items: [
          { key: 'colony-avatar', label: 'Customize character', hint: 'Outfit, skin, portrait', icon: Shirt, onSelect: s.toggleAvatar },
          { key: 'colony-mic', label: s.isMuted ? 'Turn voice on' : 'Mute voice', icon: s.isMuted ? Mic : MicOff, onSelect: s.toggleMic },
          { key: 'colony-cam', label: s.isCamOff ? 'Turn video on' : 'Turn video off', icon: s.isCamOff ? Video : VideoOff, onSelect: s.toggleCam },
        ],
      }, ...(s.isAdmin ? [{
        key: 'colony-admin', label: 'Admin',
        items: [{ key: 'colony-map-editor', label: 'Map editor', hint: 'Barriers for this room', icon: Map, onSelect: s.openEditor }],
      }] : []), {
        key: 'colony-view', label: `View · ${Math.round(s.zoom * 100)}%`,
        items: [
          { key: 'colony-zoom-in', label: 'Zoom in', icon: ZoomIn, disabled: s.zoom >= 2, onSelect: () => s.setZoom(z => Math.min(2, +(z + 0.25).toFixed(2))) },
          { key: 'colony-zoom-out', label: 'Zoom out', icon: ZoomOut, disabled: s.zoom <= 0.5, onSelect: () => s.setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2))) },
          { key: 'colony-zoom-reset', label: 'Reset zoom', icon: RotateCcw, onSelect: () => s.setZoom(1) },
        ],
      }];
    };
    const offFile = registerSurfaceFileGroups(file);
    const offEdit = registerSurfaceEditGroups(edit);
    return () => { offFile(); offEdit(); };
  }, []);
}