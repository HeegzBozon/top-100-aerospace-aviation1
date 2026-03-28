import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

// Lazy load HLS.js at module level
let HlsLoaded = null;
const loadHls = async () => {
  if (HlsLoaded) return HlsLoaded;
  try {
    HlsLoaded = (await import('hls.js')).default;
    return HlsLoaded;
  } catch (err) {
    console.error('[HLS] Failed to load hls.js:', err);
    return null;
  }
};

export default function HLSVideoPlayer({ hlsUrl, youtubeId, title, geoBlocked, onError }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [hlsError, setHlsError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Use proxy for geo-blocked channels
  const proxiedHlsUrl = geoBlocked && hlsUrl
    ? `/api/hlsProxy?url=${encodeURIComponent(hlsUrl)}`
    : hlsUrl;

  useEffect(() => {
    const video = videoRef.current;
    
    // If no HLS, jump straight to YouTube (no HLS timeout)
    if (!proxiedHlsUrl) {
      setLoading(false);
      if (youtubeId) setShowFallback(true);
      return;
    }

    // If we have YouTube, show it first (parallel HLS load in background)
    if (youtubeId) {
      setShowFallback(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      // HLS timeout after 3s — fall back to YouTube if available
      controller.abort();
      setHlsError(true);
      if (youtubeId) setShowFallback(true);
    }, 3000);

    const initHls = async () => {
      try {
        const Hls = await loadHls();
        if (!Hls) {
          setHlsError(true);
          setShowFallback(true);
          return;
        }

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.warn('[HLS] Fatal error, falling back to YouTube:', data.details);
              setHlsError(true);
              setShowFallback(true);
              onError?.(data);
            }
          });

          hls.loadSource(proxiedHlsUrl);
          hls.attachMedia(video);
          hlsRef.current = hls;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            clearTimeout(timeoutId);
            setLoading(false);
            video.play().catch(() => {
              // Autoplay may be blocked
            });
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = proxiedHlsUrl;
          video.addEventListener(
            'loadedmetadata',
            () => {
              clearTimeout(timeoutId);
              setLoading(false);
            },
            { once: true }
          );
        } else {
          setHlsError(true);
          setShowFallback(true);
        }
      } catch (err) {
        console.error('[HLS] Init failed:', err);
        setHlsError(true);
        setShowFallback(true);
        onError?.(err);
      }
    };

    initHls();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      hlsRef.current?.destroy();
    };
  }, [proxiedHlsUrl, youtubeId, geoBlocked, onError]);

  if (!hlsUrl && !youtubeId) {
    return (
      <div className="w-full h-96 bg-black/40 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-2">
        <AlertCircle className="w-6 h-6 text-[#c9a87c]" />
        <p className="text-white/50 text-xs">No stream available</p>
      </div>
    );
  }

  // YouTube first (lazy embed—no pre-validation)
  if (showFallback && youtubeId) {
    return (
      <div className="relative w-full rounded-lg border border-white/10 overflow-hidden">
        <iframe
          width="100%"
          height="400"
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
          title={`${title} (YouTube)`}
          frameBorder="0"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        {hlsError && (
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] text-white/60">
            HLS stream unavailable
          </div>
        )}
      </div>
    );
  }

  // HLS stream (only if no YouTube or YouTube not available)
  if (!showFallback && proxiedHlsUrl) {
    return (
      <div className="relative w-full rounded-lg border border-white/10 overflow-hidden bg-black">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#c9a87c]" />
            <span className="text-[10px] text-white/40">Connecting…</span>
          </div>
        )}

        {hlsError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 gap-2">
            <AlertCircle className="w-6 h-6 text-[#c9a87c]" />
            <p className="text-white/50 text-xs">Stream unavailable</p>
          </div>
        )}

        <video ref={videoRef} controls className="w-full h-96 bg-black" title={title} />
      </div>
    );
  }

  // No fallback available
  return (
    <div className="w-full h-96 bg-black/40 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-2">
      <AlertCircle className="w-6 h-6 text-red-500" />
      <p className="text-white/50 text-xs">Stream unavailable</p>
    </div>
  );
}