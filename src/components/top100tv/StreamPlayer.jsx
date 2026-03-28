import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import RobustYouTubePlayer from '@/components/video/RobustYouTubePlayer';

let HlsLoaded = null;
const loadHls = async () => {
  if (HlsLoaded) return HlsLoaded;
  try {
    HlsLoaded = (await import('hls.js')).default;
    return HlsLoaded;
  } catch (err) {
    console.error('[HLS] Failed to load:', err);
    return null;
  }
};

export default function StreamPlayer({ stream, onError }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!stream) return;

    const video = videoRef.current;
    if (!video) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setError(true);
      setLoading(false);
    }, 5000);

    const initPlayer = async () => {
      try {
        if (stream.source_type === 'youtube') {
          // Use iframe for YouTube
          setLoading(false);
          return;
        }

        if (stream.source_type === 'hls') {
          const Hls = await loadHls();
          if (!Hls) {
            setError(true);
            return;
          }

          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              maxBufferLength: 30,
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                setError(true);
                onError?.(data);
              }
            });

            hls.loadSource(stream.stream_url);
            hls.attachMedia(video);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              clearTimeout(timeoutId);
              setLoading(false);
              video.play().catch(() => {});
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream.stream_url;
            video.addEventListener('loadedmetadata', () => {
              clearTimeout(timeoutId);
              setLoading(false);
            }, { once: true });
          }
        }
      } catch (err) {
        console.error('[StreamPlayer]', err);
        setError(true);
      }
    };

    initPlayer();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
      hlsRef.current?.destroy();
    };
  }, [stream]);

  if (stream?.source_type === 'youtube') {
    return (
      <RobustYouTubePlayer
        videoId={stream.stream_url}
        title={stream.title}
        height="100%"
        onError={onError}
        showFallbackButton={true}
      />
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-white/60 text-sm">Stream unavailable</p>
        </div>
      )}

      <video
        ref={videoRef}
        controls
        className="w-full h-full"
        playsInline
      />
    </div>
  );
}