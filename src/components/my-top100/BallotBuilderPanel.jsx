import { MANIFEST } from '@/components/voting/ballotNaming';
import ManifestMediaBlock from '@/components/my-top100/ManifestMediaBlock';

// The margin of the Manifest.
//
// Where the order stands, one key into the guide, and the house's press floor. The
// paragraphs that used to stand here — what position one means, how the order is kept,
// what a standing is and is not — are inside the guide now, so the margin carries no
// argument of its own and the page keeps its width for the list itself.
export default function BallotBuilderPanel({ rankingsCount, ballotMinimum = 1, onOpenBriefing }) {
  const remaining = Math.max(0, ballotMinimum - rankingsCount);
  const filled = Math.max(0, Math.min(100, rankingsCount));

  return (
    <div className="pb-4">
      <p className="font-body text-[9px] font-bold uppercase tracking-[0.22em] text-editorial-label">
        Selection Committee · {MANIFEST}
      </p>

      {/* Where the order stands, and the way into the guide. */}
      <div className="mt-2 border border-editorial-navy/12 bg-editorial-cream px-3.5 py-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-heading text-[24px] leading-none text-editorial-navy tabular-nums">
            {rankingsCount}
            <span className="ml-1.5 font-body text-[8.5px] font-bold uppercase tracking-[0.16em] text-editorial-navy/40">
              of 100
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

        <div className="mt-2.5 h-[2px] w-full bg-editorial-navy/10" aria-hidden="true">
          <span
            className="block h-full bg-editorial-copper transition-[width] duration-500"
            style={{ width: `${filled}%` }}
          />
        </div>
        <p
          className={`mt-1.5 font-body text-[9.5px] ${
            remaining ? 'text-editorial-navy/45' : 'text-editorial-copper'
          }`}
        >
          {remaining ? `${remaining} more to open the ballot` : 'Your ballot is open'}
        </p>
      </div>

      <ManifestMediaBlock className="mt-5" />
    </div>
  );
}