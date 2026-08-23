import { Link } from 'react-router-dom';
import { Layers, LayoutGrid, Radar, Scissors, Briefcase, Send, Network, Building2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Two-level switcher. Top level: Chamber of Commerce (convene — horizontal,
// broad, generates the corpus) vs LACE (practice — vertical, deep, distills
// the corpus into method). Sub-tabs reveal only the boards within the active
// frame, so seven surfaces stop competing for one row.
const FRAMES = [
  { key: 'chamber', label: 'Chamber of Commerce', short: 'Chamber', boards: [
    { key: 'fellow', label: 'Bulletin', to: '/', icon: LayoutGrid },
    { key: 'conference', label: 'Mission Rooms', to: '/profile', icon: Radar },
    { key: 'ribbon', label: 'Ribbon Cuttings', to: '/profile', icon: Scissors },
    { key: 'intros', label: 'Introductions', to: '/profile', icon: Send },
  ]},
  { key: 'lace', label: 'Lean Agile Center of Excellence', short: 'LACE', boards: [
    { key: 'networks', label: 'Domain Networks', to: '/profile', icon: Network },
    { key: 'jobs', label: 'Job Board', to: '/profile', icon: Briefcase },
    { key: 'platform', label: 'Backlog', to: '/platform-board', icon: Layers },
  ]},
];

export const frameForBoard = (boardKey) => {
  for (const f of FRAMES) if (f.boards.some((b) => b.key === boardKey)) return f;
  return FRAMES[0];
};

export default function BoardSwitcher({ active, accent, onSelect }) {
  const frame = frameForBoard(active);
  const cls = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap';
  const styleFor = (on) => ({ background: on ? B.navy : 'transparent', color: on ? '#fff' : B.muted });

  const renderTab = (b, on) => {
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
  };

  const renderFrameToggle = (f, on) => {
    const content = (
      <>
        <span className="hidden sm:inline">{f.label}</span>
        <span className="sm:hidden">{f.short}</span>
      </>
    );
    if (onSelect) {
      return <button key={f.key} type="button" onClick={() => onSelect(f.boards[0].key)} className={cls} style={styleFor(on)}>{content}</button>;
    }
    return <Link key={f.key} to={f.boards[0].to} className={cls} style={styleFor(on)}>{content}</Link>;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 shrink-0" style={{ color: accent }} />
        <div className="flex items-center gap-0.5 rounded-full p-0.5" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
          {FRAMES.map((f) => renderFrameToggle(f, frame.key === f.key))}
        </div>
        <div className="h-px flex-1" style={{ background: `${B.navy}14` }} />
      </div>
      <div className="flex items-center gap-0.5 rounded-full p-0.5 self-start overflow-x-auto" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        {frame.boards.map((b) => renderTab(b, active === b.key))}
      </div>
    </div>
  );
}