import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Rocket, MapPin, Radio, Clock, ExternalLink, ChevronDown, Loader2, Maximize2, Minimize2, PartyPopper } from 'lucide-react';
import { findLaunchStream } from '@/functions/findLaunchStream';
import { parseISO, differenceInSeconds, format } from 'date-fns';
import LaunchPartyModal from './LaunchPartyModal';

// ── EmbeddablePlayer ─────────────────────────────────────────────────────────
// Uses youtube-nocookie.com + YouTube IFrame API postMessage to detect error 150
// (embedding disabled by owner) and surface a "Watch on YouTube" fallback.

function EmbeddablePlayer({ youtubeId, title, onEmbedError }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (!event.origin.includes('youtube')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        // YouTube IFrame API sends error events: code 100 = not found, 101/150 = embedding disabled
        if (data?.event === 'onError' && [100, 101, 150].includes(data?.info)) {
          onEmbedError();
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onEmbedError]);

  return (
    <iframe
      ref={iframeRef}
      key={youtubeId}
      src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&enablejsapi=1`}
      title={title}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="w-full h-full border-0"
      onError={onEmbedError}
    />
  );
}

// ── helpers ───────────────────────────────────────────────────────────────────

function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v');
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0];
  } catch { return null; }
  return null;
}

function useCountdown(targetIso) {
  const [seconds, setSeconds] = useState(() =>
    targetIso ? differenceInSeconds(parseISO(targetIso), new Date()) : null
  );
  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() =>
      setSeconds(differenceInSeconds(parseISO(targetIso), new Date())), 1000
    );
    return () => clearInterval(id);
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

// ── countdown segment ────────────────────────────────────────────────────────

function CountdownSegment({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-2xl sm:text-4xl font-bold text-white leading-none">{String(value).padStart(2, '0')}</span>
      <span className="text-[10px] sm:text-xs text-[#c9a87c]/70 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function CountdownDisplay({ seconds }) {
  if (seconds == null) return null;
  const abs = Math.abs(seconds);
  const d = Math.floor(abs / 86400);
  const h = Math.floor((abs % 86400) / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const isPost = seconds <= 0;

  return (
    <div className="flex items-end gap-3 sm:gap-5">
      <span className="text-[#c9a87c] font-mono text-sm font-bold self-center mr-1">{isPost ? 'T+' : 'T-'}</span>
      {d > 0 && <><CountdownSegment value={d} label="days" /><span className="text-[#c9a87c] text-2xl font-bold self-start mt-1">:</span></>}
      <CountdownSegment value={h} label="hrs" />
      <span className="text-[#c9a87c] text-2xl font-bold self-start mt-1">:</span>
      <CountdownSegment value={m} label="min" />
      <span className="text-[#c9a87c] text-2xl font-bold self-start mt-1">:</span>
      <CountdownSegment value={s} label="sec" />
    </div>
  );
}

// ── main component ───────────────────────────────────────────────────────────

export default function LaunchTheatre({ launch, onScrollDown }) {
  const secondsToLaunch = useCountdown(launch?.net);
  const isLive = secondsToLaunch !== null && secondsToLaunch <= 0;
  const [ytSearchId, setYtSearchId] = useState(null);
  const [ytSearching, setYtSearching] = useState(false);

  // Extract YouTube ID from LL2 vidURLs
  const youtubeIdFromLL2 = useMemo(() => {
    if (!launch?.vidURLs?.length) return null;
    for (const v of launch.vidURLs) {
      const url = v?.url;
      if (!url || typeof url !== 'string') continue;
      const id = extractYouTubeId(url);
      if (id) return id;
    }
    return null;
  }, [launch?.vidURLs]);

  // If no LL2 stream, search YouTube automatically
  useEffect(() => {
    if (youtubeIdFromLL2 || !launch?.id) return;
    setYtSearching(true);
    findLaunchStream({
      launchId: launch.id,
      launchName: launch.mission?.name || launch.name,
      provider: launch.launch_service_provider?.name || '',
    })
      .then(res => {
        const url = res?.data?.url;
        if (url) setYtSearchId(extractYouTubeId(url));
      })
      .catch(() => {})
      .finally(() => setYtSearching(false));
  }, [launch?.id, youtubeIdFromLL2]);

  const youtubeId = youtubeIdFromLL2 || ytSearchId;
  const [partyOpen, setPartyOpen] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const videoContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset embed error when youtubeId changes
  useEffect(() => { setEmbedError(false); }, [youtubeId]);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const otherStreams = useMemo(() =>
    (launch?.vidURLs || []).filter(v => {
      const url = v?.url || v;
      return !url?.includes('youtube') && !url?.includes('youtu.be');
    }), [launch?.vidURLs]);

  if (!launch) return null;

  const providerName = launch.launch_service_provider?.name || null;
  const rocketName = launch.rocket?.configuration?.name || null;
  const locationName = launch.pad?.location?.name || launch.pad?.name || '';
  const imageUrl = launch.image || null;
  const statusName = launch.status?.name || 'TBD';
  const isGo = launch.status?.abbrev === 'Go';
  const missionDesc = launch.mission?.description || null;
  const launchDate = launch.net ? parseISO(launch.net) : null;

  return (
    <section
      className="relative w-full min-h-[520px] sm:min-h-[600px] flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1d2d 0%, #152a42 60%, #1e3a5a 100%)' }}
      aria-label="Launch Theatre"
    >
      {/* ── Starfield texture overlay ── */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      {/* ── Gold accent line ── */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#c9a87c] to-transparent" />

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-0">

        {/* Left: Info panel */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 py-10 lg:py-14 lg:max-w-[45%]">
          {/* Status + provider row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isGo ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/10 text-white/60 border border-white/10'}`}>
              {statusName}
            </span>
            {isLive && (
              <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                <Radio className="w-2.5 h-2.5" /> LIVE NOW
              </span>
            )}
            {providerName && (
              <span className="text-xs font-semibold text-[#c9a87c]">{providerName}</span>
            )}
          </div>

          {/* Mission name */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight mb-2">
            {launch.name}
          </h2>

          {/* Rocket + location */}
          <div className="flex flex-col gap-1.5 mb-6">
            {rocketName && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Rocket className="w-3.5 h-3.5 text-[#c9a87c] flex-shrink-0" />
                <span>{rocketName}</span>
              </div>
            )}
            {locationName && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin className="w-3.5 h-3.5 text-[#c9a87c] flex-shrink-0" />
                <span>{locationName}</span>
              </div>
            )}
            {launchDate && (
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Clock className="w-3.5 h-3.5 text-[#c9a87c] flex-shrink-0" />
                <span>{format(launchDate, 'MMM d, yyyy · h:mm a')} local</span>
              </div>
            )}
          </div>

          {/* Countdown */}
          <CountdownDisplay seconds={secondsToLaunch} />

          {/* Mission desc */}
          {missionDesc && (
            <p className="mt-6 text-sm text-white/50 leading-relaxed line-clamp-3 max-w-md">
              {missionDesc}
            </p>
          )}

          {/* Non-YouTube stream links */}
          {otherStreams.length > 0 && (
            <div className="mt-4 flex flex-col gap-1.5">
              {otherStreams.map((v, i) => (
                <a key={i} href={v?.url || v} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#c9a87c] hover:text-[#e8d4b8] font-medium transition-colors">
                  <Radio className="w-3 h-3" />
                  {v?.title || 'Watch Stream'}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: YouTube embed or hero image */}
        <div className="flex-1 relative min-h-[260px] lg:min-h-0 flex items-center justify-center p-4 lg:p-6">
          {youtubeId ? (
            <div
              ref={videoContainerRef}
              className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 group relative"
            >
              {embedError ? (
                /* Fallback: embed blocked — show direct link */
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-black/40">
                  <Rocket className="w-10 h-10 text-[#c9a87c] opacity-70" />
                  <p className="text-white/50 text-sm text-center px-4">Stream can't be embedded here.</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Watch on YouTube
                  </a>
                </div>
              ) : (
                <EmbeddablePlayer
                  youtubeId={youtubeId}
                  title={`${launch.name} webcast`}
                  onEmbedError={() => setEmbedError(true)}
                />
              )}
              {/* Hover control bar */}
              {!embedError && (
                <div
                  aria-label="Video controls"
                  className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto"
                >
                  <span className="text-white/60 text-xs font-medium truncate pr-2">{launch.name}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://www.youtube.com/watch?v=${youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open on YouTube"
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={toggleFullscreen}
                      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                      className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-[#c9a87c] transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : ytSearching ? (
            <div className="w-full max-w-2xl aspect-video rounded-2xl border border-white/10 flex items-center justify-center bg-white/5">
              <div className="text-center space-y-3">
                <Loader2 className="w-10 h-10 text-[#c9a87c] mx-auto animate-spin" />
                <p className="text-white/40 text-sm">Finding stream…</p>
              </div>
            </div>
          ) : imageUrl ? (
            <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
              <img src={imageUrl} alt={launch.name} className="w-full h-full object-cover opacity-70" loading="eager" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Rocket className="w-12 h-12 text-[#c9a87c] mx-auto opacity-80" />
                  <p className="text-white/50 text-sm">No stream available yet</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl aspect-video rounded-2xl border border-white/10 flex items-center justify-center bg-white/5">
              <div className="text-center space-y-3">
                <Rocket className="w-16 h-16 text-[#c9a87c] mx-auto opacity-60" />
                <p className="text-white/40 text-sm">Stream coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Launch Party button ── */}
      <div className="relative z-10 flex justify-center pb-2">
        <button
          onClick={() => setPartyOpen(true)}
          aria-label="Open Launch Party"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#c9a87c] to-[#e8d4b8] text-[#0f1d2d] text-sm font-bold hover:opacity-90 transition-opacity shadow-lg"
        >
          <PartyPopper className="w-4 h-4" />
          Launch Party
        </button>
      </div>

      {/* ── Scroll down caret ── */}
      {onScrollDown && (
        <button
          onClick={onScrollDown}
          aria-label="Scroll to launch list"
          className="relative z-10 mx-auto mb-4 flex flex-col items-center gap-1 text-white/30 hover:text-[#c9a87c] transition-colors"
        >
          <span className="text-[10px] uppercase tracking-widest">All Launches</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      )}

      {/* ── Bottom fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0f1d2d)' }}
      />

      {/* ── Launch Party Modal ── */}
      {partyOpen && (
        <LaunchPartyModal
          launch={launch}
          youtubeId={youtubeId}
          onClose={() => setPartyOpen(false)}
        />
      )}
    </section>
  );
}