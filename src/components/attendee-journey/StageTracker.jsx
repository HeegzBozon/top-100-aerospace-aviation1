import { Check } from 'lucide-react';
import { CONFERENCE_APPS } from '@/components/conferences/os/conferenceApps';
import { B } from './journeyConfig';

// The four stages as one strip of cards, each carrying its own progress, with the whole
// journey's measure drawn across the top.
export default function StageTracker({ active, onChange, progress }) {
  const overall = Math.round(CONFERENCE_APPS.reduce((sum, s) => sum + (progress[s.key] || 0), 0) / 4);
  return (
    <div className="rounded-sm p-2.5" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: B.copper }}>Your journey</p>
        <p className="font-heading text-[13px] tabular-nums" style={{ color: B.navy }}>{overall}%</p>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: B.sand }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${overall}%`, background: B.copper }} />
      </div>
      <div role="tablist" className="mt-2.5 grid grid-cols-4 gap-1.5">
        {CONFERENCE_APPS.map((stage) => {
          const value = progress[stage.key] || 0;
          const on = stage.key === active;
          return (
            <button
              key={stage.key}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(stage.key)}
              className="flex min-w-0 flex-col items-start gap-1 rounded-sm px-1.5 py-1.5 text-left"
              style={{ background: on ? `${B.gold}1f` : B.cream, border: `1px solid ${on ? B.gold : B.border}` }}
            >
              <span className="flex w-full items-center justify-between">
                <span className="font-heading text-[8.5px]" style={{ color: B.muted }}>{stage.index}</span>
                {value === 100 && <Check className="h-3 w-3" style={{ color: B.copper }} />}
              </span>
              <span className="w-full truncate text-[9.5px] font-bold uppercase tracking-[0.06em]" style={{ color: B.navy }}>{stage.short}</span>
              <span className="h-1 w-full overflow-hidden rounded-full" style={{ background: B.sand }}>
                <span className="block h-full" style={{ width: `${value}%`, background: B.gold }} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}