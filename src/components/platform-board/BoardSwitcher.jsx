import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Layers, LayoutGrid, Radar, Scissors, Briefcase, Send, Network } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Two groups — Convene (horizontal, broad) and Practice (vertical, deep) —
// so the loop reads in its running direction: convening generates the corpus,
// practice distills it. The Domain Network is the Practice spine.
const GROUPS = [
  { label: 'Convene', boards: [
    { key: 'fellow', label: 'Bulletin', to: '/', icon: LayoutGrid },
    { key: 'conference', label: 'Mission Rooms', to: '/profile', icon: Radar },
    { key: 'ribbon', label: 'Ribbon Cuttings', to: '/profile', icon: Scissors },
    { key: 'intros', label: 'Introductions', to: '/profile', icon: Send },
  ]},
  { label: 'Practice', boards: [
    { key: 'networks', label: 'Domain Networks', to: '/profile', icon: Network },
    { key: 'jobs', label: 'Job Board', to: '/profile', icon: Briefcase },
    { key: 'platform', label: 'Backlog', to: '/platform-board', icon: Layers },
  ]},
];

export default function BoardSwitcher({ active, accent, onSelect }) {
  const cls = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors';
  const styleFor = (on) => ({ background: on ? B.navy : 'transparent', color: on ? '#fff' : B.muted });

  return (
    <div className="flex items-center gap-1 rounded-full p-1 shrink-0" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
      {GROUPS.map((g, gi) => (
        <Fragment key={g.label}>
          {gi > 0 && <span className="w-px h-5" style={{ background: B.border }} />}
          <div className="flex items-center gap-0.5">
            {g.boards.map((b) => {
              const on = active === b.key;
              const Icon = b.icon;
              const inner = (
                <>
                  <Icon className="w-3 h-3" style={{ color: on ? '#fff' : accent }} />
                  <span className="hidden md:inline">{b.label}</span>
                </>
              );
              if (onSelect) {
                return <button key={b.key} type="button" onClick={() => onSelect(b.key)} className={cls} style={styleFor(on)}>{inner}</button>;
              }
              return <Link key={b.key} to={b.to} className={cls} style={styleFor(on)}>{inner}</Link>;
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}