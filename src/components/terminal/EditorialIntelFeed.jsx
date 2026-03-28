import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Newspaper, Zap, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_CONFIG = {
  patent:        { icon: Award,    color: '#7c3aed', label: 'Patent' },
  publication:   { icon: BookOpen, color: '#4a90b8', label: 'Research' },
  media_mention: { icon: Newspaper, color: '#c9a87c', label: 'Media' },
  citation:      { icon: Zap,      color: '#059669', label: 'Citation' },
  news:          { icon: Newspaper, color: '#c9574a', label: 'News' },
};

export default function EditorialIntelFeed() {
  const [signals, setSignals] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SignalCard.list('-signal_date', 12),
      base44.entities.HonoreeMention.list('-published_at', 12),
    ])
      .then(([s, m]) => { setSignals(s || []); setMentions(m || []); })
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

  return (
    <div className="rounded-2xl overflow-hidden border flex flex-col" style={{ borderColor: 'rgba(30,58,90,0.1)' }}>
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{
          background: 'linear-gradient(90deg, rgba(30,58,90,0.06) 0%, rgba(201,168,124,0.08) 100%)',
          borderColor: 'rgba(30,58,90,0.08)',
        }}
      >
        <Zap className="w-3.5 h-3.5" style={{ color: '#c9a87c' }} />
        <span className="text-xs font-bold tracking-wide" style={{ color: '#1e3a5a', fontFamily: "var(--brand-font-serif)" }}>
          Intelligence Feed
        </span>
        <div className="flex-1" />
        <Link to="/SignalFeed" className="flex items-center gap-0.5 text-[10px] hover:opacity-70 transition-opacity" style={{ color: '#c9a87c' }}>
          All <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>
      <div className="flex-1 divide-y overflow-y-auto" style={{ maxHeight: 320, background: '#faf8f5', divideColor: 'rgba(30,58,90,0.06)' }}>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#c9a87c' }} /></div>
        ) : feed.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: 'rgba(30,58,90,0.4)' }}>No signals detected</p>
        ) : (
          feed.map(item => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.news;
            const Icon = cfg.icon;
            const d = item.date ? new Date(item.date) : null;
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-white/80 transition-colors group"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${cfg.color}15` }}>
                  <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] leading-snug font-medium line-clamp-2 group-hover:opacity-80" style={{ color: '#1e3a5a' }}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</span>
                    {item.person && <span className="text-[9px] font-medium" style={{ color: '#4a90b8' }}>· {item.person}</span>}
                    {d && <span className="text-[9px]" style={{ color: 'rgba(30,58,90,0.3)' }}>{format(d, 'MMM d')}</span>}
                  </div>
                </div>
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}