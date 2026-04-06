import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Volume2, VolumeX, X, Pause, Play } from 'lucide-react';

const YOUTUBE_VIDEO_ID = '8n1GGe0fUBs';

export default function ArtemisRadioPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(50);
  const playerRef = useRef(null);
  const ytContainerRef = useRef(null);
  const playerInitialized = useRef(false);

  // Create a persistent DOM node outside React's tree for the YT player
  useEffect(() => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;top:-9999px;left:-9999px;';
    const target = document.createElement('div');
    target.id = 'artemis-radio-yt';
    container.appendChild(target);
    document.body.appendChild(container);
    ytContainerRef.current = container;

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
        playerRef.current = null;
      }
      document.body.removeChild(container);
    };
  }, []);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) return;
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }, []);

  // Initialize player when user opens the radio for the first time
  useEffect(() => {
    if (!isOpen || playerInitialized.current) return;

    const initPlayer = () => {
      playerInitialized.current = true;
      playerRef.current = new window.YT.Player('artemis-radio-yt', {
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          mute: 1,
        },
        events: {
          onReady: (e) => {
            e.target.setVolume(volume);
            setIsPlaying(true);
          },
          onStateChange: (e) => {
            setIsPlaying(e.data === 1);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prev) prev();
        initPlayer();
      };
    }
  }, [isOpen]);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume);
    } else {
      playerRef.current.mute();
    }
    setIsMuted(!isMuted);
  }, [isMuted, volume]);

  const handleVolume = useCallback((e) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (playerRef.current) {
      playerRef.current.setVolume(v);
      if (v > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  const handleClose = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    setIsOpen(false);
    setIsPlaying(false);
  }, []);

  return (
    <>
      {/* Floating trigger pill */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed z-50 bottom-24 md:bottom-6 right-4 md:right-6 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border border-white/20 cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, #0a1526 0%, #1e3a5a 100%)',
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Artemis Radio"
          >
            <div className="relative">
              <Radio className="w-4 h-4 text-[#c9a87c]" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs font-bold text-white/90 tracking-wide uppercase hidden md:inline">Artemis Radio</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded player bar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-50 bottom-24 md:bottom-6 right-4 md:right-6 left-4 md:left-auto md:w-80 rounded-2xl shadow-2xl border border-white/15 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0a1526 0%, #112240 50%, #1e3a5a 100%)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Radio className="w-4 h-4 text-[#c9a87c]" />
                  {isPlaying && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </div>
                <div>
                  <p className="text-white text-xs font-bold tracking-wide uppercase">Artemis II Radio</p>
                  <p className="text-white/40 text-[10px]">NASA Live · Lunar Flyby</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visualizer bar (decorative) */}
            <div className="px-4 py-3 flex items-end justify-center gap-[3px] h-12">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full"
                  style={{ background: `linear-gradient(to top, #c9a87c, #4a90b8)` }}
                  animate={isPlaying && !isMuted ? {
                    height: [4, 8 + Math.random() * 16, 4 + Math.random() * 8],
                  } : { height: 4 }}
                  transition={{
                    duration: 0.4 + Math.random() * 0.4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="px-4 pb-4 flex items-center gap-3">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0"
                style={{ background: 'rgba(201, 168, 124, 0.2)' }}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-[#c9a87c]" />
                ) : (
                  <Play className="w-4 h-4 text-[#c9a87c] ml-0.5" />
                )}
              </button>

              {/* Mute toggle */}
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white/50" />
                ) : (
                  <Volume2 className="w-4 h-4 text-[#c9a87c]" />
                )}
              </button>

              {/* Volume slider */}
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume}
                onChange={handleVolume}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #c9a87c ${isMuted ? 0 : volume}%, rgba(255,255,255,0.15) ${isMuted ? 0 : volume}%)`,
                  accentColor: '#c9a87c',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}