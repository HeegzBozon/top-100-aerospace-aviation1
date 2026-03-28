import { useState } from 'react';
import { Radio } from 'lucide-react';
import { HLS_STREAMS } from '@/lib/hls-streams-config';

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
          <div className="relative w-full rounded-lg border border-white/10 overflow-hidden">
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${active.youtube}`}
              title={`${active.name} Live`}
              frameBorder="0"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse z-10">
              <Radio className="w-2.5 h-2.5" /> LIVE
            </span>
          </div>
        )}
      </div>
    </div>
  );
}