import { Link } from 'react-router-dom';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { LENSES, stagesFor } from './lensConfig';

const cls = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap';
const styleFor = (on) => ({ background: on ? B.navy : 'transparent', color: on ? '#fff' : B.muted });

// Two parallel switches: a top toggle between Lifecycle and Role & Org lenses,
// then the aspiration-arc stages (or role buckets) for the active lens.
// Button mode (hub) when handlers are provided; Link mode (standalone) otherwise.
export default function LensSwitcher({ lens, stage, accent, onLensChange, onSelectStage }) {
  const stages = stagesFor(lens);

  const renderLens = (l, on) => {
    const content = (
      <>
        <span className="hidden sm:inline">{l.label}</span>
        <span className="sm:hidden">{l.short}</span>
      </>
    );
    if (onLensChange) {
      return <button key={l.key} type="button" onClick={() => onLensChange(l.key)} className={cls} style={styleFor(on)}>{content}</button>;
    }
    return <Link key={l.key} to="/" className={cls} style={styleFor(on)}>{content}</Link>;
  };

  const renderStage = (s, on) => {
    const Icon = s.icon;
    const inner = (
      <>
        <Icon className="w-3 h-3" style={{ color: on ? '#fff' : accent }} />
        <span className="hidden md:inline">{s.label}</span>
      </>
    );
    if (onSelectStage) {
      return <button key={s.key} type="button" onClick={() => onSelectStage(s.key)} className={cls} style={styleFor(on)}>{inner}</button>;
    }
    return <Link key={s.key} to="/" className={cls} style={styleFor(on)}>{inner}</Link>;
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5 rounded-full p-0.5" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
          {LENSES.map((l) => renderLens(l, lens === l.key))}
        </div>
        <div className="h-px flex-1" style={{ background: `${B.navy}14` }} />
      </div>
      <div className="flex items-center gap-0.5 rounded-full p-0.5 self-start overflow-x-auto" style={{ background: B.cream, border: `1px solid ${B.border}` }}>
        {stages.map((s) => renderStage(s, stage === s.key))}
      </div>
    </div>
  );
}