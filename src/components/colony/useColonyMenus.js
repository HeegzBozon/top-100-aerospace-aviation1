import { useEffect, useRef } from 'react';
import { Compass, MessageCircle, MessagesSquare, Users, Shirt, LogOut, MapPin, Mic, MicOff } from 'lucide-react';
import { registerSurfaceFileGroups, registerSurfaceEditGroups } from '@/components/shell/surfaceFileMenu';
import { COLONY_ROOMS } from '@/components/colony/colonyZones';

// The Colony's own File and Edit menus, registered with the machine's menu bar while the
// campus is on the glass. File moves you around campus; Edit changes how you appear in it.
export default function useColonyMenus({ room, setRoom, openPanel, toggleParticipants, toggleAvatar, isMuted, toggleMic, leave, participantCount }) {
  const state = { room, setRoom, openPanel, toggleParticipants, toggleAvatar, isMuted, toggleMic, leave, participantCount };
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
          { key: 'colony-mic', label: s.isMuted ? 'Unmute microphone' : 'Mute microphone', icon: s.isMuted ? Mic : MicOff, onSelect: s.toggleMic },
        ],
      }];
    };
    const offFile = registerSurfaceFileGroups(file);
    const offEdit = registerSurfaceEditGroups(edit);
    return () => { offFile(); offEdit(); };
  }, []);
}