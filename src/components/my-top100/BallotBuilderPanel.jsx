import { useState } from 'react';
import { AlertCircle, ArrowRight, Compass, Loader2, RefreshCw, Search, Sparkles, UserPlus } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import { MANIFEST } from '@/components/voting/ballotNaming';
import BallotSuggestionCard from '@/components/my-top100/BallotSuggestionCard';
import usePersonalStandings from '@/components/my-top100/usePersonalStandings';

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
  rankingsCount,
  ballotMinimum = 1,
  onAdd,
  onViewProfile,
  onOpenExplorer,
  onNominate,
  onOpenVote,
  onOpenBriefing,
}) {
  // Every ballot an administrator casts is stamped as a test, so an operator's own weighing
  // lives in the test lane and never in the community's. The column opens on the lane their
  // marks are actually in, and offers the other one the way the live monitor does.
  const isAdmin = user?.role === 'admin';
  const [scope, setScope] = useState(isAdmin ? 'test' : 'community');

  const { loading, standings, standingCount, carried, error, refresh } = usePersonalStandings({
    user,
    pool,
    excludeIds: addedIds,
    scope,
  });

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
          here: a rehearsal is theirs to inspect, and it is still never the community's. */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <SectionLabel>Your Crosscheck standings</SectionLabel>
        {isAdmin && (
          <span className="flex shrink-0 items-center gap-0.5" role="group" aria-label="Which ballot to read">
            {[
              ['community', 'Community'],
              ['test', 'Test'],
            ].map(([key, name]) => {
              const active = scope === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setScope(key)}
                  className="rounded px-1.5 py-[2px] text-[6.5px] font-bold uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                  style={
                    active
                      ? key === 'test'
                        ? { background: 'rgb(var(--editorial-copper-rgb))', color: 'rgb(var(--editorial-cream-rgb))' }
                        : { background: `${brand.navy}14`, border: `1px solid ${brand.navy}22`, color: brand.navy }
                      : { background: 'transparent', border: `1px solid ${brand.navy}0D`, color: ink.soft }
                  }
                >
                  {name}
                </button>
              );
            })}
          </span>
        )}
      </div>

      <p className="mt-0.5 text-[10px] leading-relaxed" style={{ color: ink.soft }}>
        {scope === 'test'
          ? 'Your own test ballots, read back as you cast them. An internal lane: held out of the community’s measure, and out of nothing you add here.'
          : 'The names your own comparisons have carried, best first. No platform score, and no one else’s ballot.'}
      </p>

      <div className="mt-2 space-y-2">
        {(loading || loadingPool) && (
          <div className="flex items-center gap-2 rounded-2xl px-3 py-4" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: brand.gold }} />
            <p className="text-[11px]" style={{ color: `${brand.navy}55` }}>Reading your record…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl px-3 py-3" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid #c0392b44` }}>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#c0392b' }}>
              <AlertCircle className="h-3.5 w-3.5" /> {error}
            </p>
            <button
              type="button"
              onClick={() => refresh()}
              className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold"
              style={{ color: brand.navy }}
            >
              <RefreshCw className="h-3 w-3" /> Try again
            </button>
          </div>
        )}

        {!loading && !error && standingCount === 0 && carried === 0 && (
          <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}10` }}>
            <Sparkles className="h-4 w-4" style={{ color: brand.gold }} />
            <p className="mt-1.5 text-[11.5px] font-bold" style={{ color: brand.navy }}>
              Your standings begin with one set
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: ink.body }}>
              Weigh a set on the Crosscheck and the names your own judgments carry will be read
              out here, best first. Nothing is added to your ballot on your behalf.
            </p>
            {onOpenVote && (
              <button
                type="button"
                onClick={onOpenVote}
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: ink.label }}
              >
                Weigh a set <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {!loading && !error && standingCount === 0 && carried > 0 && (
          <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}10` }}>
            <p className="text-[11.5px] font-bold" style={{ color: brand.navy }}>Your carried names are not standing in this field</p>
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: ink.body }}>
              Nothing you have advanced is in the open cohort. Search the directory, or weigh a
              set in this field to begin a standing here.
            </p>
          </div>
        )}

        {!loading && !error && standingCount > 0 && standings.length === 0 && (
          <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}10` }}>
            <p className="text-[11.5px] font-bold" style={{ color: brand.navy }}>Every name your Crosscheck carries is on your ballot</p>
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: ink.body }}>
              Search the directory, or weigh more sets to widen the field.
            </p>
          </div>
        )}

        {!loading && !error && standings.map((person) => (
          <BallotSuggestionCard
            key={person.id}
            person={person}
            place={person.place}
            viewer={user}
            onAdd={onAdd}
            onView={onViewProfile}
          />
        ))}
      </div>

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