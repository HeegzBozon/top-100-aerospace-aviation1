import { Link } from 'react-router-dom';
import { Layers, LayoutGrid, Radar } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Switches boards. When embedded in the cluster, pass onSelect to toggle in place;
// otherwise (standalone page) it links between routes.
const BOARDS = [
  { key: 'fellow', label: 'Bulletin Board', to: '/', icon: LayoutGrid },
  { key: 'conference', label: 'Conference Room', to: '/profile', icon: Radar },
  { key: 'platform', label: 'Backlog', to: '/platform-board', icon: Layers },
];

export default function BoardSwitcher({ active, accent, onSelect }) {
  const cls = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors';
  const styleFor = (on) => ({ background: on ? B.navy : 'transparent', color: on ? '#fff' : B.muted });

  return (
    <div className="flex items-center gap-0.5 rounded-full p-0.5 shrink-0" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      {BOARDS.map((b) => {
        const on = active === b.key;
        const Icon = b.icon;
        const inner = (
          <>
            <Icon className="w-3 h-3" style={{ color: on ? '#fff' : accent }} />
            <span className="hidden sm:inline">{b.label}</span>
          </>
        );
        if (onSelect) {
          return <button key={b.key} type="button" onClick={() => onSelect(b.key)} className={cls} style={styleFor(on)}>{inner}</button>;
        }
        return <Link key={b.key} to={b.to} className={cls} style={styleFor(on)}>{inner}</Link>;
      })}
    </div>
  );
}