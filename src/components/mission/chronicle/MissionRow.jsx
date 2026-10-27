import { Link } from 'react-router-dom';
import { ArrowRight, Check, Lock } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// One step on the path. A route mission hands the Fellow to the surface that does the
// work and is marked done by the record it leaves there; a scene opens in place. A
// finished step keeps its note and can be walked again.
export default function MissionRow({ mission, done, open, active, locked, onOpen }) {
  return (
    <div role="listitem" className="border-t first:border-t-0" style={{ borderColor: 'rgba(30,58,90,0.10)' }}>
      <div className="flex items-start gap-3 py-3">
        <span
          className="mt-1 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[8px] font-bold"
          style={{
            background: done ? B.copper : 'transparent',
            color: done ? B.cream : B.muted,
            border: done ? 'none' : `1px solid rgba(30,58,90,0.28)`,
          }}
        >
          {done ? <Check className="h-3 w-3" /> : locked ? <Lock className="h-2.5 w-2.5" /> : mission.index}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h4 className="font-heading text-[15px] leading-snug" style={{ color: done ? B.muted : B.navy }}>
              {mission.title}
            </h4>
            {mission.xp ? (
              <span className="text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(30,58,90,0.4)' }}>
                {mission.xp} xp
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11.5px] leading-relaxed" style={{ color: B.muted }}>
            {done && mission.doneNote ? mission.doneNote : mission.lede}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {locked ? (
              <span className="text-[8.5px] font-bold uppercase tracking-[0.22em]" style={{ color: 'rgba(30,58,90,0.35)' }}>
                Opens when the cycle closes
              </span>
            ) : mission.kind === 'route' ? (
              <Link
                to={mission.to}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em]"
                style={done ? { color: B.navy, border: `1px solid ${B.border}` } : { background: B.navy, color: B.cream }}
              >
                {done ? 'Walk it again' : mission.cta}
                <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onOpen(active ? null : mission.key)}
                aria-expanded={active}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em]"
                style={done ? { color: B.navy, border: `1px solid ${B.border}` } : { background: B.navy, color: B.cream }}
              >
                {active ? 'Close' : done ? 'Replay the scene' : 'Enter the scene'}
                {active ? null : <ArrowRight className="h-2.5 w-2.5" />}
              </button>
            )}
            {mission.value ? (
              <span className="text-[8.5px] font-bold uppercase tracking-[0.18em]" style={{ color: B.copper }}>
                Chosen
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}