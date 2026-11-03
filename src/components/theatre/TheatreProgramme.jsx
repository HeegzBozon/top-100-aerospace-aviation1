import { ArrowUpRight } from 'lucide-react';
import { THEATRE, dayOf, timeOf } from './theatreConfig';

// The rest of the programme: what follows the mission on the pad.
export default function TheatreProgramme({ launches, onOpen, activeId }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[9px] font-bold uppercase tracking-[0.28em]" style={{ color: THEATRE.gold }}>
          Next on the programme
        </p>
        <span className="text-[10px]" style={{ color: THEATRE.soft }}>{launches.length} billed</span>
      </div>

      <div className="mt-2.5">
        {launches.length === 0 && (
          <p className="rounded px-3 py-6 text-center text-xs" style={{ color: THEATRE.soft, border: `1px dashed ${THEATRE.line}` }}>
            Nothing else is on the bill yet.
          </p>
        )}
        {launches.map((launch) => {
          const active = launch.id === activeId;
          return (
            <button
              key={launch.id}
              type="button"
              onClick={() => onOpen(launch)}
              className="flex w-full items-start gap-3 border-b py-2.5 text-left transition-colors"
              style={{ borderColor: 'rgba(201,168,124,0.14)', background: active ? 'rgba(201,168,124,0.08)' : 'transparent' }}
            >
              <span className="w-16 flex-shrink-0">
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: THEATRE.gold }}>
                  {dayOf(launch.net)}
                </span>
                <span className="mt-0.5 block text-[10px] tabular-nums" style={{ color: THEATRE.soft }}>
                  {timeOf(launch.net)}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold" style={{ color: THEATRE.ink }}>
                  {launch.name}
                </span>
                <span className="mt-0.5 block truncate text-[11px]" style={{ color: THEATRE.soft }}>
                  {[launch.launch_service_provider?.name, launch.rocket?.configuration?.name].filter(Boolean).join(' · ') || 'Provider to be confirmed'}
                </span>
              </span>
              <ArrowUpRight className="mt-1 h-3.5 w-3.5 flex-shrink-0" style={{ color: active ? THEATRE.gold : THEATRE.quiet }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}