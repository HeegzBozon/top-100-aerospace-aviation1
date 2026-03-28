import { useState, useEffect, useMemo } from 'react';
import { Loader2, AlertCircle, Radio, Volume2, VolumeX } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const NEWS_SOURCES = [
  {
    id: 'bloomberg',
    name: 'Bloomberg',
    icon: '📊',
    youtubeChannelId: 'UCRE8HTNHHu1sxZhRmBb4xdQ',
    description: 'Markets, technology, and business news',
  },
  {
    id: 'sky',
    name: 'Sky News',
    icon: '🌐',
    youtubeChannelId: 'UCAbqEHcMuyOsoVnE3fMYYxg',
    description: 'Live breaking news and current events',
  },
  {
    id: 'bbc',
    name: 'BBC World',
    icon: '🎬',
    youtubeChannelId: 'UCn84jAPeC7nUIJNbwHI5ocQ',
    description: 'International news coverage',
  },
  {
    id: 'aljazeera',
    name: 'Al Jazeera',
    icon: '📡',
    youtubeChannelId: 'UCNsMjmQg5dAuaX78nbreKAA',
    description: 'Global perspective on world events',
  },
];

function NewsSourceTile({ source, isActive, onClick, isLoading }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-all ${
        isActive
          ? 'border-[#c9a87c] bg-[#c9a87c]/10'
          : 'border-white/20 bg-white/5 hover:border-white/40'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{source.icon}</span>
        <div className="text-left">
          <p className="font-semibold text-white text-sm">{source.name}</p>
          <p className="text-[10px] text-white/50">{source.description}</p>
        </div>
        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-[#c9a87c] ml-auto" />}
      </div>
    </button>
  );
}

function NewsStreamEmbed({ source, isMuted }) {
  const [embedError, setEmbedError] = useState(false);
  const [isSearching, setIsSearching] = useState(true);

  // For now, construct YouTube live search URLs for each channel
  // In production, you'd call a backend function to find live streams
  const getEmbedUrl = () => {
    // This is a placeholder—ideally you'd have a backend function that finds current live streams
    return `https://www.youtube.com/embed/live_stream?channel=${source.youtubeChannelId}`;
  };

  useEffect(() => {
    // Simulate stream search delay
    const timer = setTimeout(() => setIsSearching(false), 1000);
    return () => clearTimeout(timer);
  }, [source.id]);

  if (isSearching) {
    return (
      <div className="w-full h-96 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-[#c9a87c]" />
        <span className="text-white/60 text-sm">Finding live stream…</span>
      </div>
    );
  }

  if (embedError) {
    return (
      <div className="w-full h-96 bg-black/40 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-3 p-4">
        <AlertCircle className="w-8 h-8 text-[#c9a87c]" />
        <p className="text-white/60 text-sm text-center">
          Stream embed not available. Visit {source.name} directly.
        </p>
        <a
          href={`https://www.youtube.com/@${source.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded bg-[#c9a87c] text-[#0f1d2d] text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Watch on YouTube →
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <iframe
        width="100%"
        height="400"
        src={getEmbedUrl()}
        title={`${source.name} Live Stream`}
        frameBorder="0"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="rounded-lg border border-white/10"
        onError={() => setEmbedError(true)}
      />
      <div className="absolute top-2 left-2 flex items-center gap-2 z-10">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
          <Radio className="w-2.5 h-2.5" /> LIVE
        </span>
      </div>
      <button
        onClick={() => {}}
        className="absolute top-2 right-2 z-10 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white/60 hover:text-white transition-colors"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function ComprehensiveNewsStreams() {
  const [activeSource, setActiveSource] = useState('bloomberg');
  const [isMuted, setIsMuted] = useState(false);

  const active = NEWS_SOURCES.find(s => s.id === activeSource);

  return (
    <div className="h-full flex flex-col bg-[#0a0f1e] text-white overflow-hidden rounded-xl border border-white/5">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-white/5 bg-black/40 backdrop-blur-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
          <Radio className="w-5 h-5 text-[#c9a87c]" />
          Live News Feeds
        </h2>
        <p className="text-xs text-white/50">Global coverage of aerospace, technology, and business</p>
      </div>

      {/* Source tabs/grid */}
      <div className="shrink-0 px-4 py-3 border-b border-white/5 bg-black/20 overflow-x-auto">
        <div className="flex gap-2">
          {NEWS_SOURCES.map(source => (
            <NewsSourceTile
              key={source.id}
              source={source}
              isActive={activeSource === source.id}
              onClick={() => setActiveSource(source.id)}
              isLoading={false}
            />
          ))}
        </div>
      </div>

      {/* Video embed */}
      <div className="flex-1 overflow-y-auto p-4">
        {active && <NewsStreamEmbed source={active} isMuted={isMuted} />}
      </div>

      {/* Footer info */}
      <div className="shrink-0 px-4 py-3 border-t border-white/5 bg-black/40 backdrop-blur-sm text-[10px] text-white/40">
        <p>Now: {active?.name} • Aerospace-focused stream detection coming soon</p>
      </div>
    </div>
  );
}