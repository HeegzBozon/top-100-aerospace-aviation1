import { useEffect, useRef, useState } from 'react';
import '@/components/my-top100/manifestMeter.css';
import { MANIFEST_TARGET, MANIFEST_CEILING, MANIFEST_MARKS } from '@/components/my-top100/manifestTargets';

// The measure of the Manifest, read across the masthead.
//
// The one instrument of the head: the roll fills in copper, one cream seam for every
// quarter of the hundred, and anything carried past a hundred shows in a finer rose gold
// band beneath it. The head takes a single struck pulse when the count lands on a mark —
// the only reward it offers, and it offers it once.
export default function ManifestMeasure({ count = 0, onOpenBriefing }) {
  const total = Math.max(0, count || 0);
  const remaining = Math.max(0, MANIFEST_TARGET - total);
  const filled = Math.min(100, (total / MANIFEST_TARGET) * 100);
  const beyond = Math.max(0, total - MANIFEST_TARGET);
  const beyondFilled = Math.min(100, (beyond / (MANIFEST_CEILING - MANIFEST_TARGET)) * 100);

  const previous = useRef(total);
  const [struck, setStruck] = useState(false);

  useEffect(() => {
    const before = previous.current;
    previous.current = total;
    if (total <= before) return undefined;
    if (!MANIFEST_MARKS.some((mark) => before < mark && total >= mark)) return undefined;
    setStruck(true);
    const timer = setTimeout(() => setStruck(false), 900);
    return () => clearTimeout(timer);
  }, [total]);

  const standing = remaining
    ? `${remaining} to complete your Top 100`
    : beyond
      ? `${beyond} beyond your hundred · ${MANIFEST_CEILING - total} places left`
      : 'Your Top 100 is complete';

  return (
    <div className={`mt-3 ${struck ? 'mp-strike' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-body text-[9px] uppercase tracking-[0.2em] text-editorial-navy/45 tabular-nums">
          <span className="font-heading text-[13px] leading-none text-editorial-navy/70">{total}</span> of{' '}
          {MANIFEST_TARGET}
        </p>
        {onOpenBriefing && (
          <button
            type="button"
            onClick={onOpenBriefing}
            className="shrink-0 border border-editorial-copper/40 px-2 py-1 font-body text-[9px] font-bold uppercase tracking-[0.14em] text-editorial-navy transition-colors hover:bg-editorial-copper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/50"
          >
            How it works
          </button>
        )}
      </div>

      <div
        className="mp-track mt-2"
        role="progressbar"
        aria-valuenow={total}
        aria-valuemin={0}
        aria-valuemax={MANIFEST_TARGET}
        aria-label={`${total} of ${MANIFEST_TARGET} on the Manifest`}
      >
        <span className="mp-fill" style={{ width: `${filled}%` }}>
          <span className="mp-sheen" aria-hidden="true" />
        </span>
        {[25, 50, 75].map((mark) => (
          <span key={mark} className="mp-tick" style={{ left: `${mark}%` }} aria-hidden="true" />
        ))}
      </div>

      {beyond > 0 && (
        <div className="mp-track mp-track-fine mt-1" aria-hidden="true">
          <span className="mp-beyond" style={{ width: `${beyondFilled}%` }} />
        </div>
      )}

      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <p className="font-body text-[9.5px] text-editorial-navy/45">{standing}</p>
        <p className="shrink-0 font-body text-[9.5px] font-bold uppercase tracking-[0.12em] text-editorial-label tabular-nums">
          {beyond > 0 ? `+${beyond}` : `${Math.round(filled)}%`}
        </p>
      </div>
    </div>
  );
}