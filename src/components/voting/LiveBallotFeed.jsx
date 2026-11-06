import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import useLiveBallotFeed from '@/hooks/useLiveBallotFeed';
import SignalProgress from '@/components/voting/monitor/SignalProgress';
import LatestReviews from '@/components/voting/monitor/LatestReviews';

// The operator's window onto the counting cohort while it is being weighed. Two readings,
// on one plate: how far the analysis has got (the primary reading — a monitor is for the
// shape of the field, not for the last row written), and the sets themselves as they land.
// Admin only, and read only — nothing here is read by discovery, ranking, or scoring.
const TABS = [
  { key: 'progress', label: 'Signal progress' },
  { key: 'reviews', label: 'Latest reviews' },
];

export default function LiveBallotFeed({ seasonId, refreshToken = 0 }) {
  const { data, loading, error, updatedAt, refresh } = useLiveBallotFeed(seasonId, refreshToken);
  const [tab, setTab] = useState('progress');

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.62)', border: `1px solid ${brand.navy}14` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
              style={{ background: brand.gold }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: brand.gold }} />
          </span>
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: brand.gold }}>
            Live monitor
          </p>
        </span>
        <button
          type="button"
          onClick={refresh}
          aria-label="Refresh the feed"
          className="flex h-5 w-5 items-center justify-center rounded-full transition-colors"
          style={{ background: `${brand.navy}08` }}
        >
          <RefreshCw
            className={`h-2.5 w-2.5 ${loading ? 'animate-spin' : ''}`}
            style={{ color: ink.soft }}
          />
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-1" role="tablist" aria-label="Monitor reading">
        {TABS.map((entry) => {
          const active = tab === entry.key;
          return (
            <button
              key={entry.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(entry.key)}
              className="flex-1 rounded-md px-1.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={
                active
                  ? { background: `${brand.navy}12`, border: `1px solid ${brand.navy}24`, color: brand.navy }
                  : { background: 'transparent', border: `1px solid ${brand.navy}0F`, color: ink.soft }
              }
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="mt-3 rounded-lg px-2.5 py-2" style={{ background: '#B8733310', border: '1px solid #B8733330' }}>
          <p className="text-[10px] leading-snug" style={{ color: '#8F5C2C' }}>
            {error}
          </p>
          <button
            type="button"
            onClick={refresh}
            className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em]"
            style={{ color: '#8F5C2C' }}
          >
            Try again
          </button>
        </div>
      ) : tab === 'progress' ? (
        <SignalProgress data={data} loading={loading} />
      ) : (
        <LatestReviews data={data} loading={loading} updatedAt={updatedAt} />
      )}
    </div>
  );
}