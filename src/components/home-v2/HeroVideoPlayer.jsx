import { useState, useRef } from 'react';
import { Play, Volume2, VolumeX, Maximize } from 'lucide-react';

export default function HeroVideoPlayer({ videoUrl }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(!muted);
    }
  };

  const handleFullscreen = (e) => {
    e.stopPropagation();
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  // Detect YouTube URLs
  const youtubeId = videoUrl?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];

  if (youtubeId) {
    return (
      <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {!playing ? (
          <button onClick={() => setPlaying(true)} className="absolute inset-0 w-full h-full group cursor-pointer">
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#c9a87c]/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Play className="w-7 h-7 text-white ml-1" fill="white" />
              </div>
            </div>
          </button>
        ) : (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0`}
            title="Hero Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  // Direct video file
  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
      <video
        ref={videoRef}
        src={videoUrl}
        muted={muted}
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={() => setPlaying(false)}
      />

      {!playing ? (
        <button onClick={handlePlay} className="absolute inset-0 w-full h-full group cursor-pointer bg-black/30 hover:bg-black/20 transition-colors">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#c9a87c]/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-7 h-7 text-white ml-1" fill="white" />
            </div>
          </div>
        </button>
      ) : (
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button onClick={toggleMute} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
            {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
          <button onClick={handleFullscreen} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 transition-colors">
            <Maximize className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </div>
  );
}