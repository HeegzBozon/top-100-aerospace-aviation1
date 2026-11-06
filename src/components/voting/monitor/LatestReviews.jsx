import { Activity } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';

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

// The sets themselves, newest first: who weighed which four records, and which name stood
// first and which last. Read only.
export default function LatestReviews({ data, loading, updatedAt, scope = 'community' }) {
  const readingTests = scope === 'test';
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between">
        <p className="text-[8.5px] font-bold uppercase tracking-[0.24em]" style={{ color: ink.soft }}>
          {readingTests ? 'Latest test runs' : 'Latest reviews'}
        </p>
        {updatedAt && (
          <p className="text-[8.5px]" style={{ color: ink.soft }}>
            {elapsed(updatedAt.toISOString())}
          </p>
        )}
      </div>

      {loading && !data ? (
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
                <span className="shrink-0 text-[8.5px]" style={{ color: ink.soft }}>
                  {elapsed(set.created_date)}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[9.5px]" style={{ color: ink.soft }}>
                <span style={{ color: brand.gold }}>▲</span> {set.top_name || 'Nominee'}
                <span className="mx-1" style={{ color: ink.soft }}>·</span>
                <span style={{ color: '#8F5C2C' }}>▼</span> {set.bottom_name || 'Nominee'}
              </p>
              {set.is_test && !readingTests && (
                <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em]" style={{ color: ink.soft }}>
                  Test set · not measured
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 rounded-lg px-3 py-4 text-center" style={{ background: `${brand.navy}05` }}>
          <Activity className="mx-auto h-3.5 w-3.5" style={{ color: ink.soft }} />
          <p className="mt-1.5 font-heading text-[11px]" style={{ color: brand.navy }}>
            {readingTests ? 'No test runs yet' : 'No ballots yet'}
          </p>
          <p className="mt-0.5 text-[9px] leading-snug" style={{ color: ink.soft }}>
            {readingTests
              ? 'Walk the ballot as an administrator and the set lands here, held out of the count.'
              : 'Sets appear here the moment a Fellow records one.'}
          </p>
        </div>
      )}
    </div>
  );
}