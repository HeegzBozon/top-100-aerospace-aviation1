import { COLONY_ROOMS } from '@/components/colony/colonyZones';
import ColonyListPanel from './ColonyListPanel';

// The teleporter on the station deck. It does the two things the deck was built for: it
// puts you down at the Main Entrance, and it reads as the campus directory — every room,
// and every door standing inside one, a single step away.
export default function ColonyTransit({ current, onRoom, onSurface, onClose }) {
  const doors = Object.entries(COLONY_ROOMS).flatMap(([, room]) =>
    (room.zones || []).filter(z => z.to).map(z => ({ ...z, roomLabel: room.label }))
  );

  const items = [
    // The Main Entrance is the first key on the plate. The deck exists to put you there.
    {
      key: 'main-entrance', label: 'Main Entrance', note: current === 'lobby' ? 'You are here' : 'Lobby',
      disabled: current === 'lobby', act: () => onRoom('lobby'),
    },
    // Every other room on the campus, the deck itself excepted.
    ...Object.entries(COLONY_ROOMS)
      .filter(([key]) => key !== 'station' && key !== 'lobby')
      .map(([key, room]) => ({
        key: `room-${key}`, label: room.label, note: key === current ? 'You are here' : 'Room',
        disabled: key === current, act: () => onRoom(key),
      })),
    // And the doors that open a surface rather than another room.
    ...doors.map(z => ({ key: `door-${z.key}`, label: z.label, note: z.roomLabel, act: () => onSurface(z.to) })),
  ];

  return <ColonyListPanel title="The Teleporter" items={items} onPick={(it) => it.act()} onClose={onClose} />;
}