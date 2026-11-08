import { COLONY_ROOMS } from '@/components/colony/colonyZones';
import ColonyListPanel from './ColonyListPanel';

// Who's online and where: pick someone to go to the room they are standing in.
export default function ColonyOnline({ participants, positions, localSessionId, myRoom, onGo, onClose }) {
  const items = participants.map((p) => {
    const mine = p.session_id === localSessionId;
    const room = mine ? myRoom : positions[p.session_id]?.room || 'station';
    return {
      key: p.session_id, room,
      label: `${p.user_name || 'Member'}${mine ? ' (You)' : ''}`,
      note: COLONY_ROOMS[room]?.label || 'Campus',
      disabled: mine || room === myRoom,
    };
  });
  return <ColonyListPanel title="Online now" items={items} empty="Nobody else is on campus yet."
    onPick={(it) => onGo(it.room)} onClose={onClose} />;
}