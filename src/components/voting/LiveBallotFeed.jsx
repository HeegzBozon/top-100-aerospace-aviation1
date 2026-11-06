import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import useLiveBallotFeed from '@/hooks/useLiveBallotFeed';
import SignalProgress from '@/components/voting/monitor/SignalProgress';
import LatestReviews from '@/components/voting/monitor/LatestReviews';
import OnTheWire from '@/components/voting/monitor/OnTheWire';

// The operator's window onto the counting cohort while it is being weighed. Two readings
// on one plate: how far the analysis has got — the primary reading, since a monitor is for
// the shape of the field rather than the last row written — and the sets themselves as they
// land. Under both, the building itself: who is signed in and who is standing on the floor.
// Admin only, and read only: nothing here is read by discovery, ranking, or scoring.
const TABS = [
  { key: 'progress', label: 'Signal progress' },
  { key: 'reviews', label: 'Latest reviews' },
];

// Two records stand side by side in the same cohort: what the Fellows are weighing, and
// what the house's own walkthroughs wrote. Every set cast by an administrator is stamped
// as a test, so this is one switch over one query rather than two panels.
const SCOPES = [
  { key: 'community', label: 'Community' },
  { key: 'test', label: 'Test' },
];

const RULE = '1px solid rgb(var(--editorial-sand-rgb))';

export default function LiveBallotFeed({ seasonId, refreshToken = 0, pool = 0 }) {
  const [scope, setScope] = useState('community');
  const { data, loading, error, updatedAt, refresh } = useLiveBallotFeed(seasonId, refreshToken, scope);
  const [tab, setTab] = useState('progress');
  const readingTests = scope === 'test';

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ background: 'rgba(255,255,255,0.72)', border: `1px solid ${brand.navy}14` }}
    >
      <div className="flex items-center justify-between gap-2 px-3 pb-1.5 pt-2.5">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: brand.gold }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: brand.gold }} />
          </span>
          <p className="text-[8px] font-bold uppercase tracking-[0.3em]" style={{ color: ink.label }}>
            Live monitor
          </p>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {/* Which record is being read. Copper on the test side, because a test run is
              never part of the count. */}
          <span className="flex items-center gap-0.5" role="group" aria-label="Which ballot to read">
            {SCOPES.map((entry) => {
              const active = scope === entry.key;
              return (
                <button
                  key={entry.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setScope(entry.key)}
                  className="rounded px-1.5 py-[2px] text-[6.5px] font-bold uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                  style={
                    active
                      ? entry.key === 'test'
                        ? { background: 'rgb(var(--editorial-copper-rgb))', color: 'rgb(var(--editorial-cream-rgb))' }
                        : { background: `${brand.navy}14`, border: `1px solid ${brand.navy}22`, color: brand.navy }
                      : { background: 'transparent', border: `1px solid ${brand.navy}0D`, color: ink.soft }
                  }
                >
                  {entry.label}
                </button>
              );
            })}
          </span>
          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh the monitor"
            className="flex h-5 w-5 items-center justify-center rounded-full transition-colors"
            style={{ background: `${brand.navy}08` }}
          >
            <RefreshCw className={`h-2.5 w-2.5 ${loading ? 'animate-spin' : ''}`} style={{ color: ink.soft }} />
          </button>
        </span>
      </div>

      {readingTests && (
        <p className="px-3 pb-1.5 text-[7px] font-bold uppercase tracking-[0.16em]" style={{ color: ink.label }}>
          Test runs · held out of the count
        </p>
      )}

      <div className="flex gap-1 px-3 pb-2" role="tablist" aria-label="Monitor reading">
        {TABS.map((entry) => {
          const active = tab === entry.key;
          return (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(entry.key)}
              className="flex-1 rounded px-1.5 py-1 text-[7px] font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={
                active
                  ? { background: `${brand.navy}0E`, border: `1px solid ${brand.navy}20`, color: brand.navy }
                  : { background: 'transparent', border: `1px solid ${brand.navy}0D`, color: ink.soft }
              }
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      <div className="px-3 pb-3">
        {error ? (
          <div className="rounded px-2 py-2" style={{ background: 'rgba(184,115,51,0.06)', border: '1px solid rgba(184,115,51,0.22)' }}>
            <p className="text-[8.5px] leading-snug" style={{ color: ink.label }}>
              {error}
            </p>
            <button
              type="button"
              onClick={refresh}
              className="mt-1 text-[7.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: ink.label }}
            >
              Try again
            </button>
          </div>
        ) : tab === 'progress' ? (
          <SignalProgress data={data} loading={loading} pool={pool} scope={scope} />
        ) : (
          <LatestReviews data={data} loading={loading} updatedAt={updatedAt} scope={scope} />
        )}
      </div>

      <div className="px-3 pb-3 pt-2.5" style={{ borderTop: RULE }}>
        <OnTheWire />
      </div>
    </div>
  );
}