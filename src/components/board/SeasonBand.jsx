import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import YearProgressRule from '@/components/fellow-home/season/YearProgressRule';
import { BRAND } from './boardConfig';
import { ArrowRight, Loader2 } from 'lucide-react';

const UNIT = (ms) => {
  const total = Math.max(ms, 0);
  return [
    ['Days', Math.floor(total / 86400000)],
    ['Hrs', Math.floor((total / 3600000) % 24)],
    ['Min', Math.floor((total / 60000) % 60)],
    ['Sec', Math.floor((total / 1000) % 60)],
  ];
};

// The live head of the Season column: which phase the cycle is in, how long is
// left of it, how much of the year has run, and the one action the phase asks
// for. Phase resolution is the committee's own resolver, so the board and the
// masthead can never disagree about where the season stands.
export default function SeasonBand({ phase, loading }) {
  const target = phase?.target ? new Date(phase.target).getTime() : null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target || phase?.settled) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target, phase?.settled]);

  if (loading) {
    return (
      <div
        className="flex items-center gap-2 rounded-[10px] px-3 py-2.5"
        style={{ background: '#FFFFFF', border: `1px solid ${BRAND.gold}55` }}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: BRAND.copper }} />
        <span className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: BRAND.copper }}>
          Reading the season
        </span>
      </div>
    );
  }

  const primary = phase?.actions?.find((action) => action.primary) || null;

  return (
    <div
      className="rounded-[10px] px-3 py-3"
      style={{ background: '#FFFFFF', border: `1px solid ${BRAND.gold}66` }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: BRAND.navy }}
        >
          {phase?.label || 'Committee convening soon'}
        </span>
        {phase?.targetLabel ? (
          <span className="text-[10px] font-semibold" style={{ color: BRAND.copper }}>
            {phase.targetLabel}
          </span>
        ) : null}
      </div>

      {target && !phase?.settled ? (
        <div className="mt-2 flex items-baseline gap-2">
          {UNIT(target - now).map(([label, value], i) => (
            <div key={label} className="flex items-baseline gap-2">
              {i > 0 ? (
                <span className="text-sm leading-none" style={{ color: `${BRAND.navy}40` }}>
                  :
                </span>
              ) : null}
              <div className="text-center">
                <div
                  className="font-heading text-xl leading-none tabular-nums"
                  style={{ color: BRAND.navy, fontWeight: 700 }}
                >
                  {String(value).padStart(2, '0')}
                </div>
                <div
                  className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: 'rgba(30,58,90,0.5)' }}
                >
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-1.5 text-[11px] leading-snug" style={{ color: 'rgba(26,26,26,0.66)' }}>
          {phase?.key === 'concluded'
            ? 'The cycle is closed. Its record is immutable.'
            : 'No live countdown. The committee is convening.'}
        </p>
      )}

      <div className="mt-3 border-t pt-3" style={{ borderColor: 'rgba(30,58,90,0.10)' }}>
        <YearProgressRule accent={BRAND.copper} />
      </div>

      {primary ? (
        <Link
          to={primary.to}
          className="mt-3 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.18em]"
          style={{ color: BRAND.copper }}
        >
          {primary.label}
          <ArrowRight className="h-[11px] w-[11px]" />
        </Link>
      ) : null}
    </div>
  );
}