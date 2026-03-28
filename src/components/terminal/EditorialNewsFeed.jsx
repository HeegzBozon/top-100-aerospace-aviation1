import { useAviationNews } from '@/lib/intelligence/hooks';
import { ExternalLink, Newspaper, Loader2 } from 'lucide-react';

const CATEGORY_COLORS = {
  geopolitics: '#c9574a',
  defense: '#1e3a5a',
  technology: '#4a90b8',
  markets: '#c9a87c',
  aviation: '#d4a574',
};

export default function EditorialNewsFeed() {
  const { data, isLoading } = useAviationNews();
  const items = data?.items || [];

  return (
    <div
      className="rounded-2xl overflow-hidden border flex flex-col"
      style={{ borderColor: 'rgba(30,58,90,0.1)' }}
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{
          background: 'linear-gradient(90deg, rgba(30,58,90,0.06) 0%, rgba(201,168,124,0.08) 100%)',
          borderColor: 'rgba(30,58,90,0.08)',
        }}
      >
        <Newspaper className="w-3.5 h-3.5" style={{ color: '#c9a87c' }} />
        <span
          className="text-xs font-bold tracking-wide"
          style={{ color: '#1e3a5a', fontFamily: "var(--brand-font-serif, 'Playfair Display', Georgia, serif)" }}
        >
          Aerospace & Defense Wire
        </span>
        <div className="flex-1" />
        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <div
        className="flex-1 overflow-y-auto divide-y"
        style={{ maxHeight: 360, background: '#faf8f5', divideColor: 'rgba(30,58,90,0.06)' }}
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#c9a87c' }} />
          </div>
        ) : items.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: 'rgba(30,58,90,0.4)' }}>No news available</p>
        ) : (
          items.slice(0, 15).map(item => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-white/80 transition-colors group"
            >
              <div
                className="w-1 h-full min-h-[24px] rounded-full shrink-0 mt-0.5"
                style={{ background: CATEGORY_COLORS[item.category] || '#d4a574' }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] leading-snug font-medium line-clamp-2 group-hover:opacity-80 transition-opacity"
                  style={{ color: '#1e3a5a' }}
                >
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: CATEGORY_COLORS[item.category] || '#d4a574' }}>
                    {item.category}
                  </span>
                  <span className="text-[9px]" style={{ color: 'rgba(30,58,90,0.35)' }}>
                    {item.source_name}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 shrink-0 mt-1 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: '#1e3a5a' }} />
            </a>
          ))
        )}
      </div>
    </div>
  );
}