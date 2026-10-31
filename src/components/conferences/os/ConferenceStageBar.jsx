import { Link } from 'react-router-dom';
import { CONFERENCE_APPS } from './conferenceApps';

// The four stages as a tracker along the foot of the title screen: one rail, a node per
// stage, lit up to the stage the cursor stands on. Each node keeps data-hh-key so the
// wheel and the keypad still land on it.
export default function ConferenceStageBar({ cursorKey }) {
  const at = Math.max(0, CONFERENCE_APPS.findIndex((a) => a.key === cursorKey));
  const fill = (at / (CONFERENCE_APPS.length - 1)) * 100;

  return (
    <nav aria-label="Conference stages" className="cfs-readout relative rounded-[9px] px-2 pb-2 pt-3">
      <div className="absolute left-[12.5%] right-[12.5%] top-[22px] h-[3px] rounded-full bg-editorial-cream/12">
        <div className="h-full rounded-full bg-editorial-copper transition-all duration-500" style={{ width: `${fill}%` }} />
      </div>
      <div className="relative grid grid-cols-4">
        {CONFERENCE_APPS.map((app, i) => {
          const Icon = app.icon;
          const lit = i <= at;
          const on = i === at;
          return (
            <Link
              key={app.key}
              to={app.to}
              data-hh-key={app.key}
              aria-current={on ? 'true' : undefined}
              className="flex min-w-0 flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                  lit ? 'border-editorial-copper bg-editorial-copper text-editorial-cream' : 'border-editorial-cream/25 bg-editorial-navy text-editorial-cream/50'
                } ${on ? 'ring-2 ring-editorial-gold/50' : ''}`}
              >
                <Icon className="h-2.5 w-2.5" />
              </span>
              <span className={`w-full truncate text-center text-[9px] font-bold uppercase tracking-[0.1em] ${on ? 'text-editorial-gold' : 'text-editorial-cream/70'}`}>
                {app.short}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}