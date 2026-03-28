import { useAviationNews } from '@/lib/intelligence/hooks';
import { ExternalLink } from 'lucide-react';

const THREAT_COLORS = {
  5: 'border-l-red-500',
  4: 'border-l-orange-500',
  3: 'border-l-amber-400',
  2: 'border-l-blue-400',
  1: 'border-l-slate-600',
};

export function TerminalNewsFeed() {
  const { data } = useAviationNews();
  const items = data?.items || [];

  if (!items.length) {
    return <p className="text-[10px] text-slate-600 font-mono text-center py-4">Loading feeds…</p>;
  }

  return (
    <div className="space-y-0.5">
      {items.slice(0, 25).map(item => {
        const borderClass = THREAT_COLORS[item.threat_level] || 'border-l-slate-700';
        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block px-2 py-1.5 border-l-2 ${borderClass} hover:bg-slate-800/60 transition-colors group`}
          >
            <div className="flex items-start gap-1.5">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-200 leading-tight line-clamp-2 group-hover:text-white">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-slate-500 font-mono">{item.source_name}</span>
                  {item.category && (
                    <span className="text-[9px] text-slate-600 font-mono uppercase">{item.category}</span>
                  )}
                </div>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5" />
            </div>
          </a>
        );
      })}
    </div>
  );
}