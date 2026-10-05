import { Activity, Satellite, Zap, Newspaper, Rocket, Loader2 } from 'lucide-react';

const LAYER_CONFIG = [
  { key: 'flights', label: 'Live Flights', icon: Activity, source: 'adsb.lol' },
  { key: 'satellites', label: 'Satellites', icon: Satellite, source: 'CelesTrak' },
  { key: 'launches', label: 'Launches', icon: Rocket, source: 'Launch Library 2' },
  { key: 'earthquakes', label: 'Earthquakes', icon: Zap, source: 'USGS' },
  { key: 'news', label: 'News', icon: Newspaper, source: 'GDELT' },
];

export default function GlobeControlPanel({ data, layers, onToggle }) {
  const counts = {
    flights: data.flights?.data?.total ?? 0,
    satellites: data.satellites?.data?.total ?? 0,
    launches: data.launches?.data?.total ?? 0,
    earthquakes: data.earthquakes?.data?.total ?? 0,
    news: data.news?.data?.total ?? 0,
  };

  const loading = {
    flights: data.flights?.isLoading,
    satellites: data.satellites?.isLoading,
    launches: data.launches?.isLoading,
    earthquakes: data.earthquakes?.isLoading,
    news: data.news?.isLoading,
  };

  return (
    <div className="bg-[#0a0f1e]/90 backdrop-blur border border-[#1E3A5A]/40 rounded-lg p-3 space-y-1.5 w-56">
      <div className="text-[10px] font-mono tracking-[0.2em] text-[#C9A87C] uppercase mb-2">
        Intelligence Layers
      </div>
      {LAYER_CONFIG.map(({ key, label, icon: Icon, source }) => (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md transition-colors text-left ${
            layers[key]
              ? 'bg-[#1E3A5A]/30 border border-[#C9A87C]/30'
              : 'bg-transparent border border-transparent hover:bg-[#1E3A5A]/15'
          }`}
        >
          <Icon className={`w-4 h-4 shrink-0 ${layers[key] ? 'text-[#C9A87C]' : 'text-slate-600'}`} />
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-medium ${layers[key] ? 'text-cream' : 'text-slate-500'}`}>
              {label}
            </div>
            <div className="text-[9px] text-slate-600 font-mono truncate">{source}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {loading[key] && <Loader2 className="w-3 h-3 text-slate-600 animate-spin" />}
            <span className={`text-xs font-mono tabular-nums ${layers[key] ? 'text-[#C9A87C]' : 'text-slate-600'}`}>
              {counts[key].toLocaleString()}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}