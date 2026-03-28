import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function HLSVideoPlayer({ hlsUrl, youtubeId, title, onError }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // If no HLS URL, skip and show fallback
    if (!hlsUrl) {
      setLoading(false);
      return;
    }

    const initHls = async () => {
      try {
        // Dynamically import hls.js to avoid bundle bloat
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              console.warn('[HLS] Fatal error, attempting recovery:', data);
              setError(true);
              onError?.(data);
            }
          });

          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hlsRef.current = hls;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            video.play().catch(() => {
              // Autoplay may be blocked; user will click play
            });
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Fallback for Safari (native HLS support)
          video.src = hlsUrl;
          video.addEventListener('loadedmetadata', () => setLoading(false), { once: true });
        }
      } catch (err) {
        console.error('[HLS] Failed to initialize:', err);
        setError(true);
        onError?.(err);
      }
    };

    initHls();

    return () => {
      hlsRef.current?.destroy();
    };
  }, [hlsUrl, onError]);

  if (!hlsUrl && !youtubeId) {
    return (
      <div className="w-full h-96 bg-black/40 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-2">
        <AlertCircle className="w-6 h-6 text-[#c9a87c]" />
        <p className="text-white/50 text-xs">No stream available</p>
      </div>
    );
  }

  // HLS stream available
  if (hlsUrl) {
    return (
      <div className="relative w-full rounded-lg border border-white/10 overflow-hidden bg-black">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <Loader2 className="w-4 h-4 animate-spin text-[#c9a87c]" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 gap-2">
            <AlertCircle className="w-6 h-6 text-[#c9a87c]" />
            <p className="text-white/50 text-xs">Stream error — switching to backup</p>
          </div>
        )}

        <video
          ref={videoRef}
          controls
          className="w-full h-96 bg-black"
          title={title}
        />
      </div>
    );
  }

  // Fallback to YouTube
  return (
    <div className="relative w-full rounded-lg border border-white/10 overflow-hidden">
      <iframe
        width="100%"
        height="400"
        src={`https://www.youtube.com/embed/${youtubeId}`}
        title={title}
        frameBorder="0"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
}