import { Link } from 'react-router-dom';
import { Layers, Users } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Switches between the Fellow Bulletin Board and the Platform Development Board.
const BOARDS = [
  { key: 'fellow', label: 'Fellow Board', to: '/', icon: Users },
  { key: 'platform', label: 'Platform Board', to: '/platform-board', icon: Layers },
];

export default function BoardSwitcher({ active, accent }) {
  return (
    <div className="flex items-center gap-0.5 rounded-full p-0.5 shrink-0" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      {BOARDS.map((b) => {
        const on = active === b.key;
        const Icon = b.icon;
        return (
          <Link
            key={b.key}
            to={b.to}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors"
            style={{ background: on ? B.navy : 'transparent', color: on ? '#fff' : B.muted }}
          >
            <Icon className="w-3 h-3" style={{ color: on ? '#fff' : accent }} />
            <span className="hidden sm:inline">{b.label}</span>
          </Link>
        );
      })}
    </div>
  );
}