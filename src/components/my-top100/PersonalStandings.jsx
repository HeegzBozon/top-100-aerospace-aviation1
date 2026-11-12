import { useState } from 'react';
import { AlertCircle, ArrowRight, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import StandingsTable from '@/components/my-top100/StandingsTable';
import usePersonalStandings from '@/components/my-top100/usePersonalStandings';

// The Fellow's own Crosscheck standings, read back from the ballots they cast.
//
// One reading with two doors: the organizing column of the Manifest prints it under the
// ballot, and the Manifest's own tab strip opens it beside the order. It is the same record
// and the same table in both, so a name the Fellow's marks carry cannot read one way in the
// column and another way in the tab.
export default function PersonalStandings({
  user,
  pool,
  loadingPool = false,
  addedIds,
  addedNames,
  seasonIds,
  onAdd,
  onViewProfile,
  onOpenVote,
  className = '',
}) {
  // Every ballot an administrator casts is stamped as a test, so an operator's own weighing
  // lives in the test lane and never in the community's. The reading opens on the lane their
  // marks are actually in, and offers the other one the way the live monitor does.
  const isAdmin = user?.role === 'admin';
  const [scope, setScope] = useState(isAdmin ? 'test' : 'community');

  const { loading, standings, standingCount, carried, marks, otherLaneMarks, error, refresh } =
    usePersonalStandings({
      user,
      pool,
      scope,
      seasonIds,
    });

  return (
    <div className={className}>
      {isAdmin && (
        <div className="flex items-center justify-end gap-2">
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
        </div>
      )}

      <p className="text-[10.5px] leading-relaxed" style={{ color: ink.soft }}>
        This is your personal Top 100, set only by your own Crosscheck reviews, read in isolation.
        Nothing else feeds this order.
      </p>

      <div className="mt-2 space-y-2">
        {(loading || loadingPool) && (
          <div className="flex items-center gap-2 rounded-2xl px-3 py-4" style={{ background: 'rgba(255,255,255,0.6)' }}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: brand.gold }} />
            <p className="text-[11px]" style={{ color: `${brand.navy}55` }}>Reading your record…</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl px-3 py-3" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #c0392b44' }}>
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

        {/* The lane is empty but the Fellow has weighed somewhere: say where, rather than
            leaving a column that looks broken. */}
        {!loading && !error && marks === 0 && otherLaneMarks > 0 && (
          <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}10` }}>
            <p className="text-[11.5px] font-bold" style={{ color: brand.navy }}>
              Your {otherLaneMarks.toLocaleString()} evaluations are in the {scope === 'test' ? 'community' : 'test'} lane
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: ink.body }}>
              Every ballot is stamped with the lane of the account that cast it. Read the other
              lane to see the names those evaluations carried.
            </p>
            <button
              type="button"
              onClick={() => setScope(scope === 'test' ? 'community' : 'test')}
              className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]"
              style={{ color: ink.label }}
            >
              Read the {scope === 'test' ? 'community' : 'test'} lane <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {!loading && !error && standingCount === 0 && marks === 0 && otherLaneMarks === 0 && (
          <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}10` }}>
            <Sparkles className="h-4 w-4" style={{ color: brand.gold }} />
            <p className="mt-1.5 text-[11.5px] font-bold" style={{ color: brand.navy }}>
              Your standings begin with one set
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: ink.body }}>
              Weigh a set on the Crosscheck and the names your own judgments carry will be read
              out here, best first. Nothing is added to your ballot on your behalf.
            </p>
            <p className="mt-1.5 text-[9.5px] leading-relaxed" style={{ color: ink.soft }}>
              This reading is taken from the ballots filed under the account signed in, so a
              preview signed in as the platform’s own account has none to read.
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

        {!loading && !error && standings.length > 0 && (
          <StandingsTable
            standings={standings}
            viewer={user}
            addedIds={addedIds}
            addedNames={addedNames}
            onAdd={onAdd}
            onView={onViewProfile}
          />
        )}
      </div>
    </div>
  );
}