import { Link } from 'react-router-dom';
import { CONFERENCE_APPS } from './conferenceApps';

// The four stages as one horizontal bar across the foot of the title screen. Each key
// keeps data-hh-key so the console's ring and wheel still land on it.
export default function ConferenceStageBar({ cursorKey }) {
  return (
    <nav aria-label="Conference stages" className="cfs-readout grid grid-cols-4 overflow-hidden rounded-[9px]">
      {CONFERENCE_APPS.map((app, i) => {
        const Icon = app.icon;
        const on = app.key === cursorKey;
        return (
          <Link
            key={app.key}
            to={app.to}
            data-hh-key={app.key}
            aria-current={on ? 'true' : undefined}
            className={`cfs-key flex min-w-0 flex-col items-center gap-1 rounded-none px-1 py-2.5 md:py-4 ${on ? 'is-selected' : ''} ${i ? 'cfs-seam' : ''}`}
          >
            <Icon className="h-4 w-4 md:h-5 md:w-5" style={{ color: app.accent }} />
            <span className="w-full truncate text-center text-[9.5px] font-bold uppercase tracking-[0.1em] text-editorial-cream md:text-[11px]">
              {app.short}
            </span>
            <span className="flex items-center gap-1">
              <span className="cfs-led h-1 w-1 rounded-full" />
              <span className="font-heading text-[8.5px] text-editorial-cream/50">{app.index}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}