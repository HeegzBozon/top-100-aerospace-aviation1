import { useState, useEffect, useMemo } from 'react';
import { Radio, Clock, ExternalLink } from 'lucide-react';
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

export default function LaunchLiveStream({ vidURLs, netIso }) {
  const secondsToLaunch = useCountdown(netIso);
  const isLaunched = secondsToLaunch !== null && secondsToLaunch <= 0;

  const youtubeId = useMemo(() => {
    if (!vidURLs?.length) return null;
    for (const v of vidURLs) {
      const id = extractYouTubeId(v?.url || v);
      if (id) return id;
    }
    return null;
  }, [vidURLs]);

  const otherStreams = useMemo(() =>
    (vidURLs || []).filter(v => {
      const url = v?.url || v;
      return !url?.includes('youtube') && !url?.includes('youtu.be');
    }), [vidURLs]);

  if (!youtubeId && !otherStreams.length) return null;

  return (
    <div className="border-t border-gray-100 pt-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Radio className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Live Watch</h4>
        {isLaunched && (
          <span className="ml-1 inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
            LIVE
          </span>
        )}
      </div>

      {/* Countdown bar (always visible when we have a net time) */}
      {netIso && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2">
          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-mono text-sm font-bold text-white tracking-wider">
            {formatCountdown(secondsToLaunch)}
          </span>
          <span className="text-xs text-slate-400 ml-auto">
            {isLaunched ? 'since launch' : 'to launch'}
          </span>
        </div>
      )}

      {/* YouTube embed — always show when available */}
      {youtubeId && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
            title="Launch webcast"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
            loading="lazy"
          />
        </div>
      )}

      {/* Non-YouTube fallback links */}
      {otherStreams.length > 0 && (
        <div className="flex flex-col gap-1">
          {otherStreams.map((v, i) => {
            const url = v?.url || v;
            const label = v?.title || 'Watch Stream';
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                <Radio className="w-3 h-3" />
                {label} <ExternalLink className="w-3 h-3" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}