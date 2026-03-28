import { useState, useEffect, useMemo } from 'react';
import { getUpcomingLaunches } from '@/functions/getUpcomingLaunches';
import { Radio, Loader2, AlertCircle, Clock, Rocket } from 'lucide-react';
import { parseISO, differenceInSeconds } from 'date-fns';

function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
  } catch {
    return null;
  }
  return null;
}

function useCountdown(targetIso) {
  const [seconds, setSeconds] = useState(() =>
    targetIso ? differenceInSeconds(parseISO(targetIso), new Date()) : null
  );

  useEffect(() => {
    if (!targetIso) return;
    const interval = setInterval(() => {
      setSeconds(differenceInSeconds(parseISO(targetIso), new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return seconds;
}

function formatCountdown(totalSeconds) {
  if (totalSeconds == null) return '--:--:--';
  const abs = Math.abs(totalSeconds);
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const prefix = totalSeconds <= 0 ? 'T+' : 'T-';
  return d > 0 ? `${prefix}${d}d ${time}` : `${prefix}${time}`;
}

export function LiveNewsPanel() {
  const [launch, setLaunch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUpcomingLaunches({ limit: 1 })
      .then(res => {
        if (res?.data?.launches?.length > 0) {
          setLaunch(res.data.launches[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const secondsToLaunch = useCountdown(launch?.net);
  const isLaunched = secondsToLaunch !== null && secondsToLaunch <= 0;

  const youtubeId = useMemo(() => {
    if (!launch?.vidURLs?.length) return null;
    for (const v of launch.vidURLs) {
      const id = extractYouTubeId(v?.url || v);
      if (id) return id;
    }
    return null;
  }, [launch?.vidURLs]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-500 bg-[#0a0f1e] rounded-xl">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-[10px] font-mono tracking-wider">ESTABLISHING LINK...</span>
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 px-4 text-center bg-[#0a0f1e] rounded-xl">
        <Radio className="w-8 h-8 opacity-30" />
        <p className="text-xs">No upcoming launches available.</p>
      </div>
    );
  }

  const providerName = launch.launch_service_provider?.name || launch.rocket?.configuration?.name || 'Launch';
  const launchName = launch.name?.split('|')[0]?.trim() || 'Next Mission';

  return (
    <div className="h-full flex flex-col bg-[#0a0f1e] text-white overflow-hidden relative rounded-xl border border-white/5">
      {/* Background if no video */}
      {!youtubeId && launch.image && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img src={launch.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] to-transparent" />
        </div>
      )}

      {/* Info Header */}
      <div className="shrink-0 flex flex-col px-3 py-2.5 border-b border-white/5 relative z-10 bg-black/40 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#c9a87c] tracking-wider uppercase mb-0.5 truncate">
              {providerName}
            </p>
            <h3 className="text-sm font-semibold text-white/90 truncate leading-snug">
              {launchName}
            </h3>
          </div>
          
          <div className="shrink-0 text-right">
            <div className="inline-flex items-center gap-1.5 bg-black/50 border border-white/10 rounded px-2 py-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                {formatCountdown(secondsToLaunch)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video or Fallback */}
      <div className="flex-1 relative bg-black flex items-center justify-center z-10 min-h-[220px]">
        {youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&autoplay=1&mute=1`}
            title="Launch webcast"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/40 p-4 text-center">
            <Rocket className="w-10 h-10 opacity-50" />
            <p className="text-xs max-w-[200px] leading-relaxed">
              Live video stream is not yet available for this launch. Check back closer to T-0.
            </p>
          </div>
        )}
      </div>
      
      {/* Bottom bar if live */}
      {isLaunched && (
        <div className="shrink-0 flex items-center justify-center gap-2 bg-red-900/40 border-t border-red-500/20 py-1.5 z-10 relative">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-200 tracking-widest uppercase">
            Mission Underway
          </span>
        </div>
      )}
    </div>
  );
}