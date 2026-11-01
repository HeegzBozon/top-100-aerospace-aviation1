import ColonyListPanel from '@/components/colony/ColonyListPanel';

// Someone on the campus, tapped by their nameplate: the ways to reach them in the network.
export default function ColonyPersonCard({ name, onGo, onChat, onClose }) {
  const q = encodeURIComponent(name);
  const items = [
    { key: 'people', label: 'Find in AeroSync People', to: `/aerosync/people?q=${q}` },
    { key: 'following', label: 'My following ledger', to: '/aerosync/following' },
    { key: 'scan', label: 'Exchange cards (Scan)', to: '/aerosync/scan' },
    { key: 'chat', label: 'Say hello in room chat', chat: true },
  ];
  return (
    <ColonyListPanel title={name} items={items} empty="" onClose={onClose}
      onPick={(it) => (it.chat ? onChat() : onGo(it.to))} />
  );
}