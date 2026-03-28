import { useState, useEffect, useCallback } from 'react';
import { resolveYoutubeLive } from '@/functions/resolveYoutubeLive';
import { Loader2 } from 'lucide-react';

const LIVE_CHANNELS = [
  { id: 'bloomberg', name: 'BBG',   resolveChannelId: 'UCIALMKvObZNtJ6AmdCLP7Lg' },
  { id: 'aljazeera', name: 'AJ',    ytId: 'gCNeDWCI0vo' },
  { id: 'france24',  name: 'F24',   ytId: 'h3MuIUNCCLI' },
  { id: 'nasa',      name: 'NASA',  ytId: '21X5lGlDOfg' },
  { id: 'dw',        name: 'DW',    ytId: 'V1FNCH3yQcg' },
  { id: 'euronews',  name: 'Euro',  ytId: 'pykpO5kQJ98' },
];

export function LiveNewsPanel() {
  const [activeChannel, setActiveChannel] = useState(LIVE_CHANNELS[0]?.id || 'aljazeera');
  const [resolvedIds, setResolvedIds] = useState({});
  const [resolving, setResolving] = useState(false);

  const ch = LIVE_CHANNELS.find(c => c.id === activeChannel) || LIVE_CHANNELS[0];

  const resolveChannel = useCallback(async (channel) => {
    if (!channel.resolveChannelId || resolvedIds[channel.id]) return;
    setResolving(true);
    try {
      const res = await resolveYoutubeLive({ channelId: channel.resolveChannelId });
      if (res.data?.videoId) {
        setResolvedIds(prev => ({ ...prev, [channel.id]: res.data.videoId }));
      }
    } catch (e) {
      console.error('Failed to resolve live stream:', e);
    } finally {
      setResolving(false);
    }
  }, [resolvedIds]);

  useEffect(() => {
    if (ch?.resolveChannelId) {
      resolveChannel(ch);
    }
  }, [ch?.id]);

  const videoId = ch.ytId || resolvedIds[ch.id];
  const needsResolve = ch.resolveChannelId && !videoId;

  if (!ch) {
    return <p className="text-[10px] text-slate-600 font-mono text-center py-4">No channels available</p>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Channel tabs */}
      <div className="flex gap-1 flex-wrap pb-1 shrink-0">
        {LIVE_CHANNELS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveChannel(c.id)}
            className={`text-[10px] px-2 py-0.5 rounded font-mono transition-colors ${
              activeChannel === c.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Embed */}
      <div className="flex-1 min-h-0 bg-black rounded overflow-hidden">
        {needsResolve ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {resolving ? (
              <>
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-[10px] text-slate-500 font-mono">Resolving live stream…</span>
              </>
            ) : (
              <>
                <span className="text-[10px] text-slate-500 font-mono">Stream unavailable</span>
                <button
                  onClick={() => resolveChannel(ch)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-mono underline"
                >
                  Retry
                </button>
              </>
            )}
          </div>
        ) : videoId ? (
          <iframe
            key={videoId}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; storage-access"
            allowFullScreen
            title={ch.name}
          />
        ) : null}
      </div>
    </div>
  );
}