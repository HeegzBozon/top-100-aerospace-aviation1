import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Award, BookOpen, Newspaper, Zap, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_CONFIG = {
  patent:        { icon: Award,    color: 'text-purple-400' },
  publication:   { icon: BookOpen, color: 'text-blue-400' },
  media_mention: { icon: Newspaper, color: 'text-amber-400' },
  citation:      { icon: Zap,      color: 'text-emerald-400' },
  news:          { icon: Newspaper, color: 'text-rose-400' },
};

export function TerminalIntelFeed() {
  const [signals, setSignals] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SignalCard.list('-signal_date', 15),
      base44.entities.HonoreeMention.list('-published_at', 15),
    ])
      .then(([s, m]) => {
        setSignals(s || []);
        setMentions(m || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const feed = useMemo(() => {
    const items = [
      ...signals.map(s => ({
        id: `sig-${s.id}`,
        type: s.signal_type || 'media_mention',
        title: s.headline || s.title || '',
        person: s.nominee_name || null,
        url: s.evidence_links?.[0] || '#',
        date: s.signal_date,
      })),
      ...mentions.map(m => ({
        id: `men-${m.id}`,
        type: 'news',
        title: m.article_title || '',
        person: m.nominee_name || null,
        url: m.article_url || '#',
        date: m.published_at,
      })),
    ];
    items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return items;
  }, [signals, mentions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!feed.length) {
    return <p className="text-[10px] text-slate-600 font-mono text-center py-4">No intelligence signals</p>;
  }

  return (
    <div className="space-y-0.5">
      {feed.map(item => {
        const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.news;
        const Icon = cfg.icon;
        const d = item.date ? new Date(item.date) : null;

        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 px-2 py-1.5 hover:bg-slate-800/60 transition-colors rounded group"
          >
            <Icon className={`w-3 h-3 ${cfg.color} shrink-0 mt-0.5`} />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-slate-200 leading-tight line-clamp-2 group-hover:text-white">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {item.person && <span className="text-[9px] text-sky-400 font-mono truncate">{item.person}</span>}
                {d && <span className="text-[9px] text-slate-600 font-mono">{format(d, 'MMM d')}</span>}
              </div>
            </div>
            <ExternalLink className="w-2.5 h-2.5 text-slate-600 group-hover:text-slate-400 shrink-0 mt-0.5" />
          </a>
        );
      })}
    </div>
  );
}