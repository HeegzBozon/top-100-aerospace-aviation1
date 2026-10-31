import { Link } from 'react-router-dom';
import { CONFERENCE_APPS } from './conferenceApps';

// The four stages as a tracker along the foot of the title screen: a lit copper rail,
// numbered nodes, and a glowing marker on the stage the cursor stands on. Each node keeps
// data-hh-key so the wheel and the keypad still land on it.
export default function ConferenceStageBar({ cursorKey }) {
  // No stage is lit until the wheel lands on one: the title screen stands before the cycle.
  const at = CONFERENCE_APPS.findIndex((a) => a.key === cursorKey);
  const fill = at < 0 ? 0 : (at / (CONFERENCE_APPS.length - 1)) * 100;
  const current = CONFERENCE_APPS[at];

  return (
    <nav aria-label="Conference stages" className="cfs-readout relative overflow-hidden rounded-[12px] px-3 pb-2.5 pt-2.5">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <span className="text-[7.5px] font-bold uppercase tracking-[0.24em] text-editorial-gold/80">
          {current ? `Stage ${current.index} of 04` : 'The cycle'}
        </span>
        <span className="truncate font-heading text-[12px] text-editorial-cream">
          {current ? current.title : 'Plan · Do · Check · Act'}
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-[12.5%] right-[12.5%] top-[13px] h-[4px] rounded-full bg-editorial-cream/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
          <div className="h-full rounded-full bg-gradient-to-r from-editorial-copper via-editorial-gold to-editorial-gold shadow-[0_0_10px_rgba(201,168,124,0.6)] transition-all duration-500" style={{ width: `${fill}%` }} />
        </div>
        <div className="relative grid grid-cols-4">
          {CONFERENCE_APPS.map((app, i) => {
            const Icon = app.icon;
            const lit = i <= at;
            const on = i === at;
            return (
              <Link key={app.key} to={app.to} data-hh-key={app.key} aria-current={on ? 'true' : undefined}
                className="flex min-w-0 flex-col items-center gap-1.5">
                <span className={`relative flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  on ? 'scale-110 border-editorial-gold bg-gradient-to-b from-editorial-gold to-editorial-copper text-editorial-navy shadow-[0_0_14px_rgba(201,168,124,0.75)]'
                    : lit ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
                    : 'border-editorial-cream/20 bg-editorial-navy text-editorial-cream/45'}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {on && <span className="absolute inset-0 animate-ping rounded-full border border-editorial-gold/50" />}
                </span>
                <span className={`max-w-full truncate text-[10px] font-semibold leading-none ${on ? 'text-editorial-gold' : lit ? 'text-editorial-cream' : 'text-editorial-cream/50'}`}>
                  {app.short}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}