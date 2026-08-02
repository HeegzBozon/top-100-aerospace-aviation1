import { useMemo } from 'react';
import { useAviationNews } from '@/lib/intelligence/hooks';
import { Newspaper } from 'lucide-react';

// The advocacy layer of Chamber 2.0 — a thin editorial news/policy ticker that
// sits at the top of the hero, mirroring what a chamber does for its industry.
export default function AdvocacyStrip() {
  const { data: newsData } = useAviationNews();
  const headlines = useMemo(
    () => (newsData?.items?.slice(0, 10).map((i) => i.title) ?? []).filter(Boolean),
    [newsData],
  );

  const feed = headlines.length
    ? headlines
    : [
        'FAA issues updated commercial spaceflight integration guidance',
        'AIA advocates for sustained R&D authorization in next appropriations cycle',
        'Industry coalition briefs Hill on aerospace workforce pipeline gaps',
        'TOP 100 publishes Season 4 measurement framework — open for review',
      ];

  return (
    <div
      className="flex h-9 items-center gap-3 overflow-hidden px-4 text-[11px] shrink-0"
      style={{
        background: 'linear-gradient(90deg, #07111f 0%, #0a1626 50%, #07111f 100%)',
        borderBottom: '1px solid rgba(201,168,124,0.18)',
      }}
    >
      <span className="flex items-center gap-1.5 shrink-0 font-bold uppercase tracking-[0.22em] text-[#c9a87c]">
        <Newspaper className="h-3 w-3" /> Advocacy
      </span>
      <span className="hidden h-3 w-px shrink-0 bg-white/15 sm:block" />
      <span className="hidden shrink-0 items-center gap-1 sm:flex">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
        <span className="font-semibold uppercase tracking-wider text-white/50">Signal</span>
      </span>
      <div className="flex-1 min-w-0 overflow-hidden whitespace-nowrap">
        <span key={feed[0]} className="inline-block animate-marquee text-[10px] text-white/55">
          {feed.join('   ·   ')}
        </span>
      </div>
    </div>
  );
}