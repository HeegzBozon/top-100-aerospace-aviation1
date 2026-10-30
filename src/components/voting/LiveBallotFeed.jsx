import { Activity, RefreshCw } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import useLiveBallotFeed from '@/hooks/useLiveBallotFeed';

function elapsed(iso) {
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return '';
  const secs = Math.max(0, Math.round((Date.now() - at) / 1000));
  if (secs < 45) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// The operator's window onto the counting cohort while it is being weighed: how many
// ballots have landed, how many Fellows have stood, the pace of the last quarter hour,
// and the sets themselves, newest first. Admin only, and read only — nothing here is
// read by discovery, ranking, or scoring.
export default function LiveBallotFeed({ seasonId, refreshToken = 0 }) {
  const { data, loading, error, updatedAt, refresh } = useLiveBallotFeed(seasonId, refreshToken);

  const figures = [
    { label: 'Comparisons', value: data?.comparisons ?? 0 },
    { label: 'Voters', value: data?.voters ?? 0 },
    { label: 'Last 15m', value: data?.recentComparisons ?? 0 },
  ];

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
            style={{ color: `${brand.navy}60` }}
          />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {figures.map((f) => (
          <div key={f.label} className="rounded-lg px-2 py-1.5" style={{ background: `${brand.navy}08` }}>
            <p className="font-heading text-[15px] leading-none" style={{ color: brand.navy }}>
              {loading && !data ? '—' : f.value}
            </p>
            <p
              className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em]"
              style={{ color: `${brand.navy}50` }}
            >
              {f.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: `${brand.navy}50` }}>
            Latest sets
          </p>
          {updatedAt && (
            <p className="text-[8.5px]" style={{ color: `${brand.navy}35` }}>
              {elapsed(updatedAt.toISOString())}
            </p>
          )}
        </div>

        {error ? (
          <div className="mt-2 rounded-lg px-2.5 py-2" style={{ background: '#B8733310', border: '1px solid #B8733330' }}>
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
        ) : loading && !data ? (
          <div className="mt-2 space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 animate-pulse rounded-lg" style={{ background: `${brand.navy}06` }} />
            ))}
          </div>
        ) : data?.feed?.length ? (
          <ul className="mt-2 divide-y" style={{ borderColor: `${brand.navy}08` }}>
            {data.feed.map((set) => (
              <li key={set.key} className="py-1.5" style={{ borderColor: `${brand.navy}0A` }}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-[10px] font-semibold" style={{ color: brand.navy }}>
                    {set.voter_email}
                  </p>
                  <span className="shrink-0 text-[8.5px]" style={{ color: `${brand.navy}40` }}>
                    {elapsed(set.created_date)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[9.5px]" style={{ color: `${brand.navy}70` }}>
                  <span style={{ color: brand.gold }}>▲</span> {set.top_name || 'Nominee'}
                  <span className="mx-1" style={{ color: `${brand.navy}25` }}>·</span>
                  <span style={{ color: '#8F5C2C' }}>▼</span> {set.bottom_name || 'Nominee'}
                </p>
                {set.is_test && (
                  <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: `${brand.navy}30` }}>
                    Test set · not measured
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 rounded-lg px-3 py-4 text-center" style={{ background: `${brand.navy}05` }}>
            <Activity className="mx-auto h-3.5 w-3.5" style={{ color: `${brand.navy}30` }} />
            <p className="mt-1.5 font-heading text-[11px]" style={{ color: brand.navy }}>
              No ballots yet
            </p>
            <p className="mt-0.5 text-[9px] leading-snug" style={{ color: `${brand.navy}45` }}>
              Sets appear here the moment a Fellow records one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}