import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ListOrdered, BookMarked } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { useCommitteePhase } from './useCommitteePhase';

const ICONS = { ArrowRight, ListOrdered, BookMarked };

const SETTLED_LABEL = {
  concluded: 'Concluded',
  convening: 'Convening soon',
  review: 'In deliberation',
};

function getTimeLeft(target) {
  if (!target) return null;
  const diff = Math.max(new Date(target).getTime() - Date.now(), 0);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

// Phase-aware masthead left column. Reads the active season and renders the
// countdown + action-link set for the current phase (nominations, voting,
// review, concluded, convening). The visual language is constant across
// phases so the masthead reads as one institutional artifact; only the label
// and the offered action swap.
export default function CommitteePhasePanel({ accent }) {
  const { loading, phase, error } = useCommitteePhase();
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(phase?.target));

  useEffect(() => {
    setTimeLeft(getTimeLeft(phase?.target));
    if (!phase?.target || phase.settled) return undefined;
    const t = setInterval(() => setTimeLeft(getTimeLeft(phase.target)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  if (loading) {
    return (
      <div>
        <div className="h-3 w-32 rounded animate-pulse mb-3" style={{ background: `${B.navy}0f` }} />
        <div className="h-9 w-52 rounded animate-pulse" style={{ background: `${B.navy}0f` }} />
      </div>
    );
  }

  const liveCountdown = phase?.target && !phase.settled && timeLeft;
  const units = liveCountdown
    ? [['Days', timeLeft.days], ['Hours', timeLeft.hours], ['Mins', timeLeft.mins], ['Secs', timeLeft.secs]]
    : null;
  const settledLabel = SETTLED_LABEL[phase?.key] || 'In session';

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
          {phase?.label || 'Selection Committee'}
        </p>
        {phase?.targetLabel && (
          <p className="text-[11px] font-semibold" style={{ color: accent }}>{phase.targetLabel}</p>
        )}
      </div>

      {liveCountdown ? (
        <div className="flex items-baseline gap-3">
          {units.map(([label, value], i) => (
            <div key={label} className="flex items-baseline gap-3">
              {i > 0 && <span className="text-xl leading-none" style={{ color: `${B.navy}30` }}>:</span>}
              <div className="text-center">
                <div
                  className="text-3xl sm:text-4xl leading-none tabular-nums"
                  style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
                >
                  {String(value).padStart(2, '0')}
                </div>
                <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-2xl sm:text-3xl leading-none"
          style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 }}
        >
          {settledLabel}
        </div>
      )}

      {phase?.actions?.length > 0 && (
        <div className="mt-4 flex items-center gap-5 flex-wrap">
          {phase.actions.map((a) => {
            const Icon = ICONS[a.icon] || ArrowRight;
            return (
              <Link
                key={a.label}
                to={a.to}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-70"
                style={{ color: B.navy }}
              >
                {a.label} <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}