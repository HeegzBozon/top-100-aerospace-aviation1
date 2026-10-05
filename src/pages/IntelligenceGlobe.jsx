import { useState, useCallback, useMemo } from 'react';
import { useGlobeData } from '@/hooks/useGlobeData';
import IntelligenceGlobeCanvas from '@/components/intelligence-globe/IntelligenceGlobeCanvas';
import GlobeControlPanel from '@/components/intelligence-globe/GlobeControlPanel';
import GlobeDetailPanel from '@/components/intelligence-globe/GlobeDetailPanel';

export default function IntelligenceGlobe() {
  const [layers, setLayers] = useState({
    flights: true,
    satellites: true,
    launches: true,
    earthquakes: true,
    news: true,
  });

  const [selected, setSelected] = useState(null);
  const onSelect = useCallback(item => setSelected(item), []);

  const data = useGlobeData(layers);

  // Combine all query data for the canvas
  const globeData = useMemo(() => ({
    flights: data.flights.data,
    satellites: data.satellites.data,
    earthquakes: data.earthquakes.data,
    news: data.news.data,
    launches: data.launches.data,
  }), [data]);

  const handleToggle = useCallback(key => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const attributions = useMemo(() => {
    const sources = [];
    if (layers.flights && data.flights.data?.attribution) sources.push(data.flights.data.attribution);
    if (layers.satellites && data.satellites.data?.attribution) sources.push(data.satellites.data.attribution);
    if (layers.launches && data.launches.data?.attribution) sources.push(data.launches.data.attribution);
    if (layers.earthquakes && data.earthquakes.data?.attribution) sources.push(data.earthquakes.data.attribution);
    if (layers.news && data.news.data?.attribution) sources.push(data.news.data.attribution);
    return [...new Set(sources)];
  }, [layers, data]);

  return (
    <div className="fixed inset-0 bg-[#070b14] overflow-hidden">
      {/* Globe canvas — full screen */}
      <IntelligenceGlobeCanvas
        data={globeData}
        layers={layers}
        onSelect={onSelect}
        selected={selected}
      />

      {/* Control panel — top left */}
      <div className="absolute top-3 left-3 z-20">
        <GlobeControlPanel data={data} layers={layers} onToggle={handleToggle} />
      </div>

      {/* Detail panel — right side */}
      <GlobeDetailPanel selected={selected} onClose={() => setSelected(null)} />

      {/* Header — top center */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="bg-[#0a0f1e]/80 backdrop-blur border border-[#1E3A5A]/40 rounded-full px-5 py-1.5">
          <span className="font-heading text-sm tracking-wider text-[#C9A87C]">
            Aerospace Intelligence Globe
          </span>
        </div>
      </div>

      {/* Attribution bar — bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-[#070b14]/80 backdrop-blur border-t border-[#1E3A5A]/30 px-4 py-1.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[9px] font-mono text-slate-500">
          {attributions.map((a, i) => (
            <span key={i}>{a}</span>
          ))}
        </div>
      </div>

      {/* Legend — bottom left */}
      <div className="absolute bottom-8 left-3 z-10 bg-[#0a0f1e]/80 backdrop-blur border border-[#1E3A5A]/40 rounded px-2.5 py-2 space-y-1 pointer-events-none">
        <div className="text-[9px] font-mono tracking-[0.15em] text-slate-500 uppercase mb-1">Legend</div>
        {layers.flights && (
          <>
            <div className="flex items-center gap-1.5 text-[10px]"><span className="text-[#B87333]">✈</span><span className="text-slate-400">Military</span></div>
            <div className="flex items-center gap-1.5 text-[10px]"><span className="text-[#7BA3C7]">✈</span><span className="text-slate-400">Civil Aviation</span></div>
          </>
        )}
        {layers.satellites && <div className="flex items-center gap-1.5 text-[10px]"><span className="text-[#C9A87C]">●</span><span className="text-slate-400">Satellite</span></div>}
        {layers.launches && <div className="flex items-center gap-1.5 text-[10px]"><span className="text-[#C9A87C]">◉</span><span className="text-slate-400">Launch Site</span></div>}
        {layers.earthquakes && <div className="flex items-center gap-1.5 text-[10px]"><span className="text-[#B87333]">●</span><span className="text-slate-400">Earthquake</span></div>}
        {layers.news && <div className="flex items-center gap-1.5 text-[10px]"><span className="text-[#FAF8F5]">●</span><span className="text-slate-400">News</span></div>}
      </div>
    </div>
  );
}