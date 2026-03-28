import { useState, useEffect, useRef } from 'react';
import { AlertCircle, Tv, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { STREAMS_DB } from '@/lib/channels-db';

const liveVideoCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchLiveVideoInfo(channelHandle) {
  const cached = liveVideoCache.get(channelHandle);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { videoId: cached.videoId };
  }

  try {
    const res = await fetch(`/api/youtube/live?channel=${encodeURIComponent(channelHandle)}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const videoId = data.videoId || null;
    liveVideoCache.set(channelHandle, { videoId, timestamp: Date.now() });
    return { videoId };
  } catch (error) {
    console.warn(`[NewsStream] Failed to fetch live info for ${channelHandle}:`, error);
    return { videoId: null };
  }
}

export function NewsStreamWidget() {
  const [selectedStream, setSelectedStream] = useState('france24');
  const [embedError, setEmbedError] = useState(false);
  const [liveYoutubeId, setLiveYoutubeId] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const fetchTimeoutRef = useRef(null);

  const stream = STREAMS_DB.find(s => s.id === selectedStream);
  if (!stream) return null;

  // Try to fetch live stream info on mount and when stream changes
  useEffect(() => {
    if (!stream.youtube) {
      setLiveYoutubeId(null);
      return;
    }

    setIsFetching(true);
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

    fetchLiveVideoInfo(stream.youtube).then(info => {
      setLiveYoutubeId(info.videoId);
      setIsFetching(false);
    });

    // Retry every 30s to check for live status
    fetchTimeoutRef.current = setInterval(() => {
      fetchLiveVideoInfo(stream.youtube).then(info => {
        setLiveYoutubeId(info.videoId);
      });
    }, 30000);

    return () => {
      if (fetchTimeoutRef.current) clearInterval(fetchTimeoutRef.current);
    };
  }, [selectedStream, stream.youtube]);

  // Use live fetch first, fallback to static channel ID
  const youtubeId = liveYoutubeId || stream.youtube;
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
          {isFetching && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600/90 text-white flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Checking…
            </span>
          )}
          {showEmbed && !isFetching && (
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