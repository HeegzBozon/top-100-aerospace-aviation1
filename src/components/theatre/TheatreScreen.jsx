import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2, Maximize2, Minimize2, Radio, Rocket } from 'lucide-react';
import { THEATRE } from './theatreConfig';

// The screen itself. A refused embed is a normal thing on YouTube, so the poster keeps a
// way out to the broadcast rather than leaving a black rectangle in the room.
export default function TheatreScreen({ launch, streamId, searching }) {
  const frameRef = useRef(null);
  const [blocked, setBlocked] = useState(false);
  const [full, setFull] = useState(false);

  useEffect(() => {
    setBlocked(false);
  }, [streamId]);

  useEffect(() => {
    const onChange = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    if (!streamId) return undefined;
    const onMessage = (event) => {
      if (!String(event.origin).includes('youtube')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onError' && [100, 101, 150].includes(data?.info)) setBlocked(true);
      } catch {
        // not one of ours
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [streamId]);

  const toggleFull = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else el.requestFullscreen?.();
  }, []);

  const poster = launch?.image || null;
  const title = launch?.name || 'Mission Theatre';

  return (
    <div
      ref={frameRef}
      className="relative overflow-hidden rounded-lg"
      style={{ background: '#04090f', border: `1px solid ${THEATRE.line}` }}
    >
      <div className="relative aspect-video w-full">
        {streamId && !blocked ? (
          <iframe
            key={streamId}
            src={`https://www.youtube-nocookie.com/embed/${streamId}?rel=0&modestbranding=1&enablejsapi=1`}
            title={`${title} live`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full border-0"
          />
        ) : blocked ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
            <Rocket className="h-8 w-8" style={{ color: THEATRE.gold }} />
            <p className="text-sm" style={{ color: THEATRE.body }}>
              This broadcast does not allow itself to be shown here.
            </p>
            <a
              href={`https://www.youtube.com/watch?v=${streamId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded bg-editorial-copper px-3.5 py-2 text-xs font-semibold"
              style={{ color: '#fdf8f0' }}
            >
              <ExternalLink className="h-3.5 w-3.5" /> Watch the broadcast
            </a>
          </div>
        ) : searching ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: THEATRE.gold }} />
            <p className="text-sm" style={{ color: THEATRE.soft }}>Finding the broadcast…</p>
          </div>
        ) : poster ? (
          <div className="relative h-full w-full">
            <img src={poster} alt={title} className="h-full w-full object-cover opacity-80" loading="eager" />
            <div className="absolute inset-0 flex items-center justify-center bg-[#04090f]/45">
              <div className="text-center">
                <Rocket className="mx-auto h-10 w-10" style={{ color: THEATRE.gold }} />
                <p className="mt-2 text-sm font-semibold" style={{ color: THEATRE.ink }}>
                  The stream opens at the pad's own clock
                </p>
                <p className="text-xs" style={{ color: THEATRE.body }}>Countdown running on the bill.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
            <Radio className="h-8 w-8" style={{ color: THEATRE.quiet }} />
            <p className="text-sm" style={{ color: THEATRE.body }}>The theatre is between broadcasts.</p>
            <p className="text-xs" style={{ color: THEATRE.soft }}>The next mission is billed alongside.</p>
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-3 px-3 py-2"
        style={{ background: THEATRE.plateSoft, borderTop: `1px solid ${THEATRE.line}` }}
      >
        <p className="min-w-0 truncate text-[11px] font-semibold tracking-wide" style={{ color: THEATRE.body }}>
          {title}
        </p>
        {streamId && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <a
              href={`https://www.youtube.com/watch?v=${streamId}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the broadcast on YouTube"
              className="flex h-7 w-7 items-center justify-center rounded"
              style={{ background: 'rgba(255,255,255,0.08)', color: THEATRE.body }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={toggleFull}
              aria-label={full ? 'Leave fullscreen' : 'Watch fullscreen'}
              className="flex h-7 w-7 items-center justify-center rounded"
              style={{ background: 'rgba(255,255,255,0.08)', color: THEATRE.body }}
            >
              {full ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}