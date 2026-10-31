import { Check } from 'lucide-react';
import { CONFERENCE_APPS } from '@/components/conferences/os/conferenceApps';
import { B } from './journeyConfig';

// The four stages as one horizontal bar pinned to the foot of the screen, each key
// carrying its own progress, with the whole journey's measure drawn across its top edge.
export default function StageTracker({ active, onChange, progress }) {
  const overall = Math.round(CONFERENCE_APPS.reduce((sum, s) => sum + (progress[s.key] || 0), 0) / 4);
  return (
    <nav
      aria-label="Conference stages"
      className="sticky bottom-0 z-30 -mx-4 mt-4"
      style={{ background: B.navy, boxShadow: '0 -8px 20px -12px rgba(3,6,13,0.7)' }}
    >
      <div className="h-[3px] w-full" style={{ background: 'rgba(250,248,245,0.12)' }} aria-label={`Journey ${overall}% complete`}>
        <div className="h-full transition-all" style={{ width: `${overall}%`, background: B.copper }} />
      </div>
      <div role="tablist" className="grid grid-cols-4">
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
              className="flex min-w-0 flex-col items-center gap-1 px-1 pb-2 pt-2"
              style={{ background: on ? 'rgba(201,168,124,0.16)' : 'transparent', borderTop: `2px solid ${on ? B.gold : 'transparent'}` }}
            >
              <span className="flex items-center gap-1">
                <span className="font-heading text-[9px]" style={{ color: on ? B.gold : 'rgba(250,248,245,0.5)' }}>{stage.index}</span>
                {value === 100 && <Check className="h-3 w-3" style={{ color: B.gold }} />}
              </span>
              <span className="w-full truncate text-center text-[10px] font-bold uppercase tracking-[0.08em]" style={{ color: on ? '#FAF8F5' : 'rgba(250,248,245,0.68)' }}>
                {stage.short}
              </span>
              <span className="h-[3px] w-3/4 overflow-hidden rounded-full" style={{ background: 'rgba(250,248,245,0.14)' }}>
                <span className="block h-full" style={{ width: `${value}%`, background: B.gold }} />
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}