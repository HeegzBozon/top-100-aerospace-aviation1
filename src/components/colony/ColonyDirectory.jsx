import { COLONY_ROOMS } from '@/components/colony/colonyZones';
import ColonyListPanel from './ColonyListPanel';

// The campus directory: every virtual room, one tap, turn or button away.
export default function ColonyDirectory({ current, onGo, onClose }) {
  const items = Object.entries(COLONY_ROOMS).map(([key, r]) => ({
    key, label: r.label, disabled: key === current, note: key === current ? 'You are here' : '',
  }));
  return <ColonyListPanel title="Campus Directory" items={items} onPick={(it) => onGo(it.key)} onClose={onClose} />;
}