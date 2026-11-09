import { Compass, Search, UserPlus } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import { MANIFEST } from '@/components/voting/ballotNaming';
import PersonalStandings from '@/components/my-top100/PersonalStandings';

// The organizing column of the ballot: how the order works, where the ballot stands, and the
// standings the Fellow's own Crosscheck has produced. The column reads only the ballots this
// Fellow cast — no platform score, no other member's weighing — and prints no counts. A name
// reaches the ballot only through the Fellow's own hand, and the whole column doubles as a
// way into a profile, a follow in AeroSync, or the directory itself.

function SectionLabel({ children }) {
  return (
    <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: `${brand.navy}55` }}>
      {children}
    </p>
  );
}

export default function BallotBuilderPanel({
  user,
  pool,
  loadingPool,
  addedIds,
  seasonIds,
  rankingsCount,
  ballotMinimum = 1,
  onAdd,
  onViewProfile,
  onOpenExplorer,
  onNominate,
  onOpenVote,
  onOpenBriefing,
}) {
  const remaining = Math.max(0, ballotMinimum - rankingsCount);

  return (
    <div className="pb-4">
      <SectionLabel>Selection Committee · {MANIFEST}</SectionLabel>
      <h2 className="mt-1 font-heading text-[22px] leading-tight" style={{ color: brand.navy }}>
        Who's on your manifest?
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: `${brand.navy}60` }}>
        Put them in order. Position one reads as position one, and the surface keeps your order
        as you go.
      </p>

      {/* Where the ballot stands, and the way into the guide. */}
      <div
        className="mt-3 flex items-center gap-2 rounded-2xl px-3 py-2.5"
        style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}10` }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tabular-nums" style={{ color: brand.navy }}>
            {rankingsCount} ranked
            <span className="font-normal" style={{ color: `${brand.navy}50` }}> of 100</span>
          </p>
          <p className="text-[10px]" style={{ color: remaining ? `${brand.navy}60` : '#2d8a4f' }}>
            {remaining ? `${remaining} more to open the ballot` : 'Counting — your ballot is open'}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenBriefing}
          className="shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: `${brand.gold}1F`, border: `1px solid ${brand.gold}66`, color: brand.navy }}
        >
          How it works
        </button>
      </div>

      {/* The Fellow's own standings, read back to them. An operator reads their test lane
          here: a rehearsal is theirs to inspect, and it is still never the community's. The
          reading itself is shared with the Manifest's Crosscheck tab, so both print one table. */}
      <PersonalStandings
        className="mt-4"
        user={user}
        pool={pool}
        loadingPool={loadingPool}
        addedIds={addedIds}
        seasonIds={seasonIds}
        onAdd={onAdd}
        onViewProfile={onViewProfile}
        onOpenVote={onOpenVote}
      />

      {/* The two ways past the standings: the whole directory, and a name it does not hold. */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenExplorer}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: `${brand.navy}06`, color: `${brand.navy}80`, border: `1px solid ${brand.navy}14` }}
        >
          <Search className="h-3 w-3" /> Search the directory
        </button>
        <button
          type="button"
          onClick={onNominate}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: 'transparent', color: `${brand.navy}70`, border: `1px solid ${brand.navy}14` }}
        >
          <UserPlus className="h-3 w-3" /> Nominate a name not here
        </button>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[9.5px] leading-relaxed" style={{ color: `${brand.navy}45` }}>
        <Compass className="mt-[1px] h-3 w-3 shrink-0" />
        A standing is a reading of your own comparisons, never a placement. Open a profile to
        follow or connect in AeroSync.
      </p>
    </div>
  );
}