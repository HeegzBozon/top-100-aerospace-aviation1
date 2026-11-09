import { useEffect, useRef, useState } from 'react';
import '@/components/my-top100/manifestMeter.css';
import { MANIFEST } from '@/components/voting/ballotNaming';
import ManifestMediaBlock from '@/components/my-top100/ManifestMediaBlock';
import { MANIFEST_TARGET, MANIFEST_CEILING, MANIFEST_MARKS } from '@/components/my-top100/manifestTargets';

// The margin of the Manifest.
//
// Where the order stands, one key into the guide, and the house's press floor. The
// paragraphs that used to stand here — what position one means, how the order is kept,
// what a standing is and is not — are inside the guide now, so the margin carries no
// argument of its own and the page keeps its width for the list itself.
//
// The measure is the one instrument in the margin that is always lit: the roll fills in
// copper, one seam for every mark along the way, and anything carried past the hundred
// shows in a finer rose gold band beneath it. The card takes a single struck pulse when the
// count lands on a mark — the only reward it offers, and it offers it once.
export default function BallotBuilderPanel({ rankingsCount, onOpenBriefing }) {
  const count = Math.max(0, rankingsCount || 0);
  const remaining = Math.max(0, MANIFEST_TARGET - count);
  const filled = Math.min(100, (count / MANIFEST_TARGET) * 100);
  const beyond = Math.max(0, count - MANIFEST_TARGET);
  const beyondFilled = Math.min(100, (beyond / (MANIFEST_CEILING - MANIFEST_TARGET)) * 100);

  const previous = useRef(count);
  const [struck, setStruck] = useState(false);

  useEffect(() => {
    const before = previous.current;
    previous.current = count;
    if (count <= before) return undefined;
    if (!MANIFEST_MARKS.some((mark) => before < mark && count >= mark)) return undefined;
    setStruck(true);
    const timer = setTimeout(() => setStruck(false), 900);
    return () => clearTimeout(timer);
  }, [count]);

  const standing = remaining
    ? `${remaining} to complete your Top 100`
    : beyond
      ? `${beyond} beyond your hundred · ${MANIFEST_CEILING - count} places left`
      : 'Your Top 100 is complete';

  return (
    <div className="pb-4">
      <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
        Selection Committee · {MANIFEST}
      </p>

      {/* Where the order stands, and the way into the guide. */}
      <div
        className={`mt-2 border border-editorial-navy/12 bg-editorial-cream px-3.5 py-3 ${
          struck ? 'mp-strike' : ''
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-heading text-[24px] leading-none text-editorial-navy tabular-nums">
            {count}
            <span className="ml-1.5 font-body text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-navy/40">
              of {MANIFEST_TARGET}
            </span>
          </p>
          <button
            type="button"
            onClick={onOpenBriefing}
            className="shrink-0 border border-editorial-copper/40 px-2 py-1 font-body text-[9px] font-bold uppercase tracking-[0.14em] text-editorial-navy transition-colors hover:bg-editorial-copper/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-copper/50"
          >
            How it works
          </button>
        </div>

        <div
          className="mp-track mt-2.5"
          role="progressbar"
          aria-valuenow={count}
          aria-valuemin={0}
          aria-valuemax={MANIFEST_TARGET}
          aria-label={`${count} of ${MANIFEST_TARGET} on the Manifest`}
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

      <ManifestMediaBlock className="mt-5" />
    </div>
  );
}