import { useState, useEffect } from 'react';
import { getSpaceNews } from '@/functions/getSpaceNews';
import { getNewsFeedDigest } from '@/functions/getNewsFeedDigest';
import { ExternalLink, Radio, Tv, RefreshCw, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LIVE_CHANNELS = [
  { id: 'bloomberg',  name: 'Bloomberg TV',  color: '#1e3a5a', url: 'https://www.youtube.com/@BloombergTelevision/live', query: 'bloomberg markets finance' },
  { id: 'bbc',        name: 'BBC News',      color: '#b91c1c', url: 'https://www.youtube.com/@BBCNews/live',             query: 'bbc news international world' },
  { id: 'aljazeera',  name: 'Al Jazeera',    color: '#c9a87c', url: 'https://www.youtube.com/@aljazeeraenglish/live',     query: 'al jazeera world news' },
  { id: 'france24',   name: 'France 24',     color: '#3b82f6', url: 'https://www.youtube.com/@France24_en/live',         query: 'france 24 europe international' },
  { id: 'nasa',       name: 'NASA Live',     color: '#0f4d8a', url: 'https://www.youtube.com/@NASA/live',               query: 'nasa space launch iss' },
  { id: 'dw',         name: 'DW News',       color: '#ef4444', url: 'https://www.youtube.com/@dwnews/live',             query: 'dw news international germany' },
  { id: 'euronews',   name: 'Euronews',      color: '#10b981', url: 'https://www.youtube.com/@euronews/live',           query: 'euronews european union' },
];

function TimeAgo({ date }) {
  if (!date) return null;
  try {
    return (
      <span className="text-[10px] text-slate-500 whitespace-nowrap">
        {formatDistanceToNow(new Date(date), { addSuffix: true })}
      </span>
    );
  } catch {
    return null;
  }
}

export function LiveNewsPanel() {
  const [activeChannel, setActiveChannel] = useState(LIVE_CHANNELS[0]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setArticles([]);

    // Try Space News API for aerospace channels, generic news digest for others
    const isAerospace = ['nasa'].includes(activeChannel.id);

    const fetcher = isAerospace
      ? getSpaceNews({ type: 'articles', search: activeChannel.query, limit: 12 })
      : getNewsFeedDigest({ query: activeChannel.query, limit: 12 });

    fetcher
      .then(res => {
        const data = res?.data;
        // Space News API
        if (data?.results) return setArticles(data.results.slice(0, 10));
        // News digest format
        if (data?.articles) return setArticles(data.articles.slice(0, 10));
        if (Array.isArray(data)) return setArticles(data.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeChannel.id, refreshKey]);

  const ch = activeChannel;

  return (
    <div className="h-full flex flex-col bg-[#0a0f1e] text-white overflow-hidden">

      {/* Channel selector */}
      <div className="shrink-0 overflow-x-auto scrollbar-hide border-b border-white/5">
        <div className="flex gap-1 p-1.5 min-w-max">
          {LIVE_CHANNELS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveChannel(c)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] font-bold tracking-wide whitespace-nowrap transition-all ${
                ch.id === c.id
                  ? 'text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              style={ch.id === c.id ? { background: c.color } : {}}
            >
              <Radio className="w-2.5 h-2.5" />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Watch Live header for active channel */}
      <div
        className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-white/5"
        style={{ background: `${ch.color}22` }}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            ON AIR
          </span>
          <span className="text-xs font-semibold text-white/80">{ch.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="text-white/30 hover:text-white/70 transition-colors p-1"
            title="Refresh feed"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <a
            href={ch.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-md text-white transition-all hover:opacity-80"
            style={{ background: ch.color }}
          >
            <Tv className="w-3 h-3" />
            Watch Live
            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
          </a>
        </div>
      </div>

      {/* News articles feed */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-[10px] font-mono tracking-wider">LOADING FEED...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 px-4 text-center">
            <Radio className="w-8 h-8 opacity-30" />
            <p className="text-xs">No articles found. Try refreshing or watch live on YouTube.</p>
            <a
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-lg text-white transition-all hover:opacity-80"
              style={{ background: ch.color }}
            >
              <Tv className="w-3.5 h-3.5" />
              Open {ch.name} Live
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {articles.map((article, i) => (
              <a
                key={article.id || article.url || i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2.5 p-2.5 hover:bg-white/5 transition-colors group"
              >
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt=""
                    className="w-14 h-10 object-cover rounded shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                    <TimeAgo date={article.published_at || article.updated_at} />
                    {article.news_site && (
                      <span className="text-[9px] text-slate-600 truncate">{article.news_site}</span>
                    )}
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-slate-700 group-hover:text-slate-400 shrink-0 mt-0.5 transition-colors" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}