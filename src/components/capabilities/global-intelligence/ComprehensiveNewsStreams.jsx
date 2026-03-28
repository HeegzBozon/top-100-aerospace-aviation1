import { useState } from 'react';
import { Radio } from 'lucide-react';
import { NEWS_CHANNELS } from '@/lib/news-channels-config';
import HLSVideoPlayer from './HLSVideoPlayer';

export default function ComprehensiveNewsStreams() {
  const [activeSource, setActiveSource] = useState('aljazeera');
  const active = NEWS_CHANNELS.find(c => c.id === activeSource);

  return (
    <div className="h-full flex flex-col bg-[#0a0f1e] text-white overflow-hidden rounded-xl border border-white/5">
      <div className="shrink-0 px-4 py-3 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-[#c9a87c]" />
          <h2 className="text-sm font-bold">Live News Streams (66 channels)</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {NEWS_CHANNELS.map(channel => (
            <button
              key={channel.id}
              onClick={() => setActiveSource(channel.id)}
              className={`shrink-0 px-3 py-1.5 rounded transition-all text-xs font-medium whitespace-nowrap ${
                activeSource === channel.id
                  ? 'bg-[#c9a87c] text-[#0f1d2d]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {channel.icon} {channel.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {active && (
          <HLSVideoPlayer
            hlsUrl={active.hls}
            youtubeId={active.youtube}
            geoBlocked={active.geoBlocked}
            title={`${active.name} Live`}
            onError={(err) => console.warn(`[${active.name}]`, err)}
          />
        )}
      </div>
    </div>
  );
}