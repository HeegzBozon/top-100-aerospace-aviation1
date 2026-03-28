import { useState } from 'react';
import { AlertCircle, Tv } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STREAMS_DB } from '@/lib/channels-db';

export function NewsStreamWidget() {
  const [selectedStream, setSelectedStream] = useState('france24');
  const [embedError, setEmbedError] = useState(false);

  const stream = STREAMS_DB.find(s => s.id === selectedStream);
  if (!stream) return null;

  const youtubeId = stream.youtube;
  const showEmbed = youtubeId && !embedError;

  return (
    <Card className="overflow-hidden border-[#c9a87c]/30 shadow-md">
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[#0f1d2d] to-[#1e3a5a] overflow-hidden">
        {showEmbed ? (
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
            title={`${stream.name} live`}
            frameBorder="0"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0 z-0"
            onError={() => setEmbedError(true)}
          />
        ) : stream.hls ? (
          <img
            src="https://via.placeholder.com/560x315?text=HLS+Stream"
            alt={stream.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="w-12 h-12 text-[#c9a87c]/20" />
          </div>
        )}

        {embedError && youtubeId && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm z-20">
            <AlertCircle className="w-6 h-6 text-[#c9a87c]" />
            <p className="text-white/60 text-xs text-center px-2">Stream unavailable</p>
          </div>
        )}

        {(!showEmbed && !stream.hls) && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d2d]/90 via-[#0f1d2d]/40 to-transparent" />
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-[#c9a87c] text-[#1e3a5a] uppercase">
            {stream.icon} Live News
          </span>
          {showEmbed && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600/90 text-white animate-pulse">
              LIVE
            </span>
          )}
        </div>
      </div>

      <CardContent className="p-4 space-y-3 bg-white">
        <div>
          <p className="text-xs font-semibold text-[#c9a87c]">{stream.region}</p>
          <h3 className="text-sm font-bold text-[#1e3a5a] leading-snug mt-0.5">{stream.name}</h3>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['france24', 'aljazeera', 'sky_news', 'bloomberg', 'bbc_news'].map(id => {
            const s = STREAMS_DB.find(x => x.id === id);
            return (
              <button
                key={id}
                onClick={() => {
                  setSelectedStream(id);
                  setEmbedError(false);
                }}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                  selectedStream === id
                    ? 'bg-[#1e3a5a] text-white'
                    : 'bg-slate-100 text-[#1e3a5a] hover:bg-slate-200'
                }`}
              >
                {s?.icon} {s?.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}