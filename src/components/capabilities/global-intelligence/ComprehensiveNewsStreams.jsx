import { useState } from 'react';
import { Radio } from 'lucide-react';
import { HLS_STREAMS } from '@/lib/hls-streams-config';
import HLSVideoPlayer from './HLSVideoPlayer';

export default function ComprehensiveNewsStreams() {
  const [activeSource, setActiveSource] = useState('aljazeera');
  const sources = Object.entries(HLS_STREAMS).map(([id, data]) => ({ id, ...data }));
  const active = sources.find(s => s.id === activeSource);

  return (
    <div className="h-full flex flex-col bg-[#0a0f1e] text-white overflow-hidden rounded-xl border border-white/5">
      <div className="shrink-0 px-4 py-3 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-2 mb-3">
          <Radio className="w-4 h-4 text-[#c9a87c]" />
          <h2 className="text-sm font-bold">Live News Streams</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {sources.map(source => (
            <button
              key={source.id}
              onClick={() => setActiveSource(source.id)}
              className={`shrink-0 px-3 py-1.5 rounded transition-all text-xs font-medium ${
                activeSource === source.id
                  ? 'bg-[#c9a87c] text-[#0f1d2d]'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {source.icon} {source.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {active && (
          <HLSVideoPlayer
            hlsUrl={active.hls}
            youtubeId={active.youtube}
            title={`${active.name} Live`}
          />
        )}
      </div>
    </div>
  );
}