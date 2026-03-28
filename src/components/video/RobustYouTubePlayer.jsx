import { useState, useEffect } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

/**
 * RobustYouTubePlayer - Handles YouTube embeds with comprehensive error handling
 * 
 * Features:
 * - Proper referrer policy to prevent Error 153
 * - Fallback "Watch on YouTube" button on embed failure
 * - Timeout detection
 * - Optional autoplay control
 * - Graceful degradation
 */
export default function RobustYouTubePlayer({
  videoId,
  title = 'Video',
  autoplay = false,
  height = '100%',
  width = '100%',
  onError = null,
  className = 'rounded-lg',
  showFallbackButton = true,
}) {
  const [embedError, setEmbedError] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Reset errors when videoId changes
    setEmbedError(false);
    setTimedOut(false);

    // Timeout detection: if iframe doesn't load within 8 seconds, show fallback
    const timeoutId = setTimeout(() => {
      setTimedOut(true);
      onError?.('YouTube embed timeout');
    }, 8000);

    return () => clearTimeout(timeoutId);
  }, [videoId, onError]);

  if (!videoId) {
    return (
      <div className={`relative w-full ${className} bg-black/40 border border-white/10 flex items-center justify-center aspect-video`}>
        <AlertCircle className="w-8 h-8 text-slate-400" />
      </div>
    );
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1' : ''}`;

  // Show error state with fallback button
  if (embedError || timedOut) {
    return (
      <div className={`relative w-full ${className} bg-black/80 border border-white/10 overflow-hidden`} style={{ height, width: '100%' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-white/70 text-sm text-center px-4">
            {timedOut ? 'Video took too long to load' : 'Could not embed YouTube video'}
          </p>
          {showFallbackButton && (
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Watch on YouTube
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className} overflow-hidden bg-black`} style={{ height, width: '100%' }}>
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title={title}
        frameBorder="0"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0"
        onError={() => {
          setEmbedError(true);
          onError?.('YouTube iframe error');
        }}
        onLoad={() => {
          // Successfully loaded
          onError?.(null);
        }}
      />
    </div>
  );
}