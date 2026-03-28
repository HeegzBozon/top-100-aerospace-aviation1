import { Play, Volume2, MapPin } from 'lucide-react';

export default function StreamGridCard({ stream, isSelected, onClick, accentColor }) {
  const categoryColors = {
    news: 'from-blue-500/20 to-blue-600/10',
    aviation: 'from-green-500/20 to-green-600/10',
    space: 'from-purple-500/20 to-purple-600/10',
    macro: 'from-red-500/20 to-red-600/10',
    defense: 'from-red-500/20 to-red-600/10',
  };

  return (
    <button
      onClick={onClick}
      className={`relative group overflow-hidden rounded-lg border-2 transition-all h-48 ${
        isSelected
          ? `border-opacity-100 shadow-lg shadow-opacity-20`
          : 'border-white/10 hover:border-white/30'
      }`}
      style={isSelected && accentColor ? {
        borderColor: accentColor,
        boxShadow: `0 0 20px ${accentColor}33`,
      } : {}}
    >
      {/* Thumbnail / Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${categoryColors[stream.category] || 'from-slate-700/20 to-slate-800/20'}`}
      >
        {stream.thumbnail_url && (
          <img
            src={stream.thumbnail_url}
            alt={stream.title}
            className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
          />
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-3">
        {/* Top Badge */}
        <div className="flex items-start justify-between">
          <span className="text-[10px] px-2 py-1 rounded-full bg-black/60 text-white capitalize font-semibold">
            {stream.category}
          </span>
          {stream.is_active && (
            <span className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-red-500/80 text-white font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              LIVE
            </span>
          )}
        </div>

        {/* Bottom Info */}
        <div>
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2">{stream.title}</h3>
          <div className="flex items-center gap-4 text-[10px] text-slate-300">
            {stream.region && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {stream.region}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              {stream.source_type}
            </div>
          </div>
        </div>
      </div>

      {/* Play Button Overlay (on hover) */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="rounded-full bg-white/20 backdrop-blur-sm p-3 border border-white/30">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      </div>
    </button>
  );
}