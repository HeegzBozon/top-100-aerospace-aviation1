import { Lock } from 'lucide-react';
import ListCanvas from '@/components/my-top100/ListCanvas';
import ManifestToCrosscheck from '@/components/my-top100/ManifestToCrosscheck';
import { MANIFEST } from '@/components/voting/ballotNaming';

// The Manifest, as an operator sees it when they walk the new Analyst's road.
//
// The order is a sample, held still: the roll is the committee's own component in its
// read-only state, so what the operator reads is the surface a Fellow builds, not a picture
// of it. The nudge beside it is the live one — the same rule and the same key a Fellow is
// given once they have two names in order — and here it carries the walkthrough on to the
// weighing instead of opening a ballot.
const SAMPLE_ORDER = [
  { nominee_id: 'preview-1', nominee_name: 'Ana Sørensen', nominee_title: 'Flight Test Engineer', nominee_company: 'Launch Systems' },
  { nominee_id: 'preview-2', nominee_name: 'Priya Raghavan', nominee_title: 'Mission Operations Lead', nominee_company: 'Orbital Gateway' },
  { nominee_id: 'preview-3', nominee_name: 'Mira Okonjo', nominee_title: 'Structures Engineer', nominee_company: 'Aero Structures Group' },
];

export default function WalkthroughManifest({ onOpenVote }) {
  return (
    <div className="bg-editorial-sand/45">
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-5 lg:px-6 lg:pt-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <aside className="border-t-2 border-editorial-copper pt-4 lg:sticky lg:top-[64px] lg:w-[330px] lg:shrink-0">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-label">
              Selection Committee · {MANIFEST}
            </p>
            <h2 className="mt-1 font-heading text-[22px] leading-tight text-editorial-navy">
              Where the Fellow lands
            </h2>
            <p className="mt-1.5 font-body text-[11px] leading-relaxed text-editorial-navy/60">
              Signing in returns them here, to the order, not to the ballot. Position one
              reads as position one: the number down the margin is the only thing that
              carries the structure, and the list is a publication of the Fellow's own —
              it feeds no score.
            </p>
            <p className="mt-2 font-body text-[11px] leading-relaxed text-editorial-navy/60">
              Two names in order is enough to begin; the field is weighed on the Crosscheck,
              and the ballot itself stays sealed.
            </p>
            <ManifestToCrosscheck count={SAMPLE_ORDER.length} onOpenVote={onOpenVote} />
          </aside>

          <div className="min-w-0 flex-1 border border-editorial-copper/25 bg-editorial-cream px-5 py-6 lg:max-w-2xl lg:px-8 lg:py-7">
            <div className="flex items-baseline justify-between gap-4 pb-4">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-editorial-label">
                {MANIFEST}
              </p>
              <p className="flex items-center gap-1.5 font-body text-[10px] uppercase tracking-[0.18em] text-editorial-navy/45 tabular-nums">
                <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                Sample order · preview only
              </p>
            </div>
            <div className="-mt-4 h-[2px] w-full bg-editorial-copper" />
            <p className="mt-3 font-heading text-2xl leading-tight text-editorial-navy sm:text-[28px]">
              The order I would keep
            </p>
            <p className="mt-2 font-body text-[11.5px] leading-relaxed text-editorial-navy/55">
              An Analyst builds this list from the season's field, up to a hundred names. It is
              the ranked choice the weighing is learned on.
            </p>

            <div className="mt-4">
              <ListCanvas
                rankings={SAMPLE_ORDER}
                readOnly
                totalCount={SAMPLE_ORDER.length}
                onReorder={() => {}}
                onRemove={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}