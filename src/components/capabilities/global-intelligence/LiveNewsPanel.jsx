import { useState, useEffect, useCallback } from 'react';
import { resolveYoutubeLive } from '@/functions/resolveYoutubeLive';
import { Loader2, MonitorPlay, Radio } from 'lucide-react';

const LIVE_CHANNELS = [
  { id: 'bloomberg', name: 'Bloomberg', query: 'Bloomberg Global Financial News Live', color: '#1e3a5a' },
  { id: 'aljazeera', name: 'Al Jazeera', query: 'Al Jazeera English Live', color: '#c9a87c' },
  { id: 'france24',  name: 'France 24', query: 'France 24 English Live', color: '#3b82f6' },
  { id: 'nasa',      name: 'NASA Live', query: 'NASA Live Official Stream', color: '#0f1d2d' },
  { id: 'dw',        name: 'DW News',   query: 'DW News Live', color: '#ef4444' },
  { id: 'euronews',  name: 'Euronews',  query: 'Euronews English Live', color: '#10b981' },
];

export function LiveNewsPanel() {
  const [activeChannel, setActiveChannel] = useState(LIVE_CHANNELS[0]?.id || 'bloomberg');
  const [resolvedIds, setResolvedIds] = useState({});
  const [resolving, setResolving] = useState(false);

  const resolveChannel = useCallback(async (channel) => {
    if (resolvedIds[channel.id]) return;
    setResolving(true);
    try {
      const res = await resolveYoutubeLive({ query: channel.query });
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
    const ch = LIVE_CHANNELS.find(c => c.id === activeChannel);
    if (ch && !resolvedIds[ch.id]) {
      resolveChannel(ch);
    }
  }, [activeChannel, resolvedIds, resolveChannel]);

  const ch = LIVE_CHANNELS.find(c => c.id === activeChannel) || LIVE_CHANNELS[0];
  const videoId = resolvedIds[ch.id];
  const needsResolve = !videoId;

  return (
    <div className="h-full flex flex-col bg-[#0a0f1e] text-white">
      {/* Top Main Video */}
      <div className="relative w-full aspect-video bg-black shrink-0 overflow-hidden border-b border-[#1e3a5a]/50">
        {needsResolve ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
             <div className="relative">
                <div className="absolute inset-0 border-t-2 border-[#c9a87c] rounded-full animate-spin w-8 h-8 opacity-70"></div>
                <div className="w-8 h-8 rounded-full border-2 border-slate-800"></div>
             </div>
             <div className="text-[10px] text-slate-400 font-mono tracking-wider animate-pulse">CONNECTING SATELLITE LINK...</div>
          </div>
        ) : (
          <iframe
            key={videoId}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            allowFullScreen
            title={ch.name}
          />
        )}
        <div className="absolute top-2 left-2 flex items-center gap-2 pointer-events-none">
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider flex items-center gap-1 shadow-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                LIVE
            </span>
            <span className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded font-medium border border-white/10 shadow-lg">
                {ch.name}
            </span>
        </div>
      </div>

      {/* Grid of channels */}
      <div className="flex-1 p-2 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          {LIVE_CHANNELS.map(c => {
             const isActive = activeChannel === c.id;
             return (
               <button
                 key={c.id}
                 onClick={() => setActiveChannel(c.id)}
                 className={`relative flex flex-col items-start p-2 rounded-lg border transition-all duration-300 ${
                   isActive 
                   ? 'bg-[#1e3a5a]/40 border-[#c9a87c]/50 shadow-[0_0_10px_rgba(201,168,124,0.1)]' 
                   : 'bg-slate-900/50 border-white/5 hover:bg-slate-800 hover:border-white/10'
                 }`}
               >
                 <div className="flex items-center justify-between w-full mb-1">
                   <span className="text-[10px] font-bold text-slate-300 tracking-wider truncate">{c.name}</span>
                   {isActive && <MonitorPlay className="w-3 h-3 text-[#c9a87c]" />}
                 </div>
                 
                 <div className="w-full h-12 bg-black rounded overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30" style={{ backgroundColor: c.color }}>
                        <Radio className="w-5 h-5 text-white" />
                    </div>
                    {isActive ? (
                        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                             <div className="flex items-end gap-0.5 h-4">
                                 {[1,2,3,4].map(i => (
                                     <div key={i} className="w-[3px] bg-red-400 animate-pulse" style={{ height: `${Math.random()*60 + 40}%`, animationDuration: `${0.5 + Math.random()}s` }}></div>
                                 ))}
                             </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    )}
                 </div>
               </button>
             );
          })}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
}