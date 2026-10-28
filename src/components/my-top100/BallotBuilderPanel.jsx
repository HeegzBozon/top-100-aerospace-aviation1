import { useEffect, useState } from 'react';
import { AlertCircle, ArrowRight, Compass, Loader2, RefreshCw, Search, Sparkles, UserPlus } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import RankedChoiceGuide from '@/components/my-top100/RankedChoiceGuide';
import BallotSuggestionCard from '@/components/my-top100/BallotSuggestionCard';
import useBallotSuggestions from '@/components/my-top100/useBallotSuggestions';

// The organizing column of the ballot: how the order works, where the ballot stands, and a
// short list of profiles drawn from the Fellow's own judging. A suggestion is never a
// placement — it reaches the ballot only through the Fellow's own hand — and the whole
// column doubles as a way into a profile, a follow in AeroSync, or the directory itself.

const guideKey = (email) => `top100.rankedBallotGuide.v1:${(email || 'guest').toLowerCase()}`;

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
}) {
  const [guideOpen, setGuideOpen] = useState(false);
  const { loading, suggestions, basis, judged, error, refresh } = useBallotSuggestions({ user, pool });

  // A voter is walked through the ranked ballot once, on the first ballot they arrange on
  // this device, and the visit is recorded the moment the guide opens — a reader who walks
  // away mid-read is still one ballot in and is not walked through it again.
  useEffect(() => {
    if (!user?.email) return;
    let seen = null;
    try {
      seen = window.localStorage.getItem(guideKey(user.email));
    } catch {
      // A browser that keeps no storage simply sees the guide again.
    }
    if (seen) return;
    setGuideOpen(true);
    try {
      window.localStorage.setItem(guideKey(user.email), new Date().toISOString());
    } catch {
      // Nothing to record.
    }
  }, [user?.email]);

  const open = suggestions.filter((person) => !addedIds.has(person.id));
  const remaining = Math.max(0, ballotMinimum - rankingsCount);

  return (
    <div className="pb-4">
      <SectionLabel>Selection Committee · Ballot</SectionLabel>
      <h2 className="mt-1 font-heading text-[22px] leading-tight" style={{ color: brand.navy }}>
        Finalize your TOP 100
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: `${brand.navy}60` }}>
        Position one reads as position one. Arrange the order below, and the surface keeps it
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
          onClick={() => setGuideOpen(true)}
          className="shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: `${brand.gold}1F`, border: `1px solid ${brand.gold}66`, color: brand.navy }}
        >
          How it works
        </button>
      </div>

      {/* The suggestions. */}
      <div className="mt-4 flex items-baseline justify-between gap-2">
        <SectionLabel>Suggested for you</SectionLabel>
        {judged > 0 && (
          <span className="text-[9.5px]" style={{ color: `${brand.navy}45` }}>
            from {judged} advanced
          </span>
        )}
      </div>

      {basis.length > 0 && (
        <p className="mt-0.5 text-[10px]" style={{ color: `${brand.navy}55` }}>
          Read from the sets you have judged · {basis.join(' · ')}
        </p>
      )}

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

        {!loading && !error && judged === 0 && (
          <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}10` }}>
            <Sparkles className="h-4 w-4" style={{ color: brand.gold }} />
            <p className="mt-1.5 text-[11.5px] font-bold" style={{ color: brand.navy }}>
              Suggestions follow your judging
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: `${brand.navy}60` }}>
              Judge a few sets on the ballot — the profiles you advance draw a short list here.
              Nothing is added to your ballot on your behalf.
            </p>
            {onOpenVote && (
              <button
                type="button"
                onClick={onOpenVote}
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: brand.gold }}
              >
                Weigh a set <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {!loading && !error && judged > 0 && open.length === 0 && (
          <div className="rounded-2xl px-3.5 py-3.5" style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}10` }}>
            <p className="text-[11.5px] font-bold" style={{ color: brand.navy }}>Every suggestion is on your ballot</p>
            <p className="mt-1 text-[10.5px] leading-relaxed" style={{ color: `${brand.navy}60` }}>
              Search the directory, or judge more sets to widen the field.
            </p>
          </div>
        )}

        {!loading && !error && open.map((person) => (
          <BallotSuggestionCard
            key={person.id}
            person={person}
            viewer={user}
            onAdd={onAdd}
            onView={onViewProfile}
          />
        ))}
      </div>

      {/* The two ways past the suggestions: the whole directory, and a name it does not hold. */}
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
        A suggestion is an invitation to look, never a placement. Open a profile to follow or
        connect in AeroSync.
      </p>

      <RankedChoiceGuide open={guideOpen} onOpenChange={setGuideOpen} />
    </div>
  );
}