import { useEffect, useRef, useState } from 'react';
import { useGlobeIntelLive, useGlobeFlightDetail } from '@/lib/intelligence/globeHooks';

export function WorldMonitorGlobe() {
  const globeRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [GlobeGL, setGlobeGL] = useState(null);

  const { data, isLoading } = useGlobeIntelLive();
  const { data: detailData } = useGlobeFlightDetail(selectedFlight?.icao24);

  // Lazy-load globe.gl
  useEffect(() => {
    import('globe.gl').then(m => setGlobeGL(() => m.default));
  }, []);

  // Initialize globe once
  useEffect(() => {
    if (!GlobeGL || !globeRef.current) return;
    const globe = GlobeGL()(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(globeRef.current.clientWidth || 600)
      .height(globeRef.current.clientHeight || 400)
      .atmosphereColor('#1a4a8a')
      .atmosphereAltitude(0.15)
      .pointOfView({ lat: 25, lng: 10, altitude: 2.0 });

    globeInstanceRef.current = globe;

    const handleResize = () => {
      if (globeRef.current) {
        globe.width(globeRef.current.clientWidth);
        globe.height(globeRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      globe._destructor?.();
    };
  }, [GlobeGL]);

  // Update flight points whenever data arrives
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !data) return;

    // Use the flat flights array from the updated backend
    const flights = (data.flights || []).map(f => ({
      lat: f.lat,
      lng: f.lon,
      label: f.callsign || f.icao24,
      icao24: f.icao24,
      color: f.isMilitary ? '#f97316' : '#60a5fa',
      size: f.isMilitary ? 0.5 : 0.25,
      isMilitary: f.isMilitary,
      altitude: f.altitude,
      speed: f.speed,
      heading: f.heading,
    }));

    // GPS jamming rings — hexes now have lat/lng decoded server-side
    const gpsHexes = (data.gpsJam?.hexes || [])
      .filter(h => h.lat && h.lng)
      .slice(0, 300);

    globe
      .pointsData(flights)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointRadius('size')
      .pointAltitude(0.005)
      .pointLabel(d => `<div style="background:#0f172a;color:#e2e8f0;padding:6px 10px;border-radius:6px;font-family:monospace;font-size:12px;border:1px solid ${d.isMilitary ? '#f97316' : '#3b82f6'}">
        ${d.isMilitary ? '🔴' : '✈️'} <b>${d.label}</b><br/>
        <span style="color:#94a3b8;font-size:10px">
          ${d.icao24?.toUpperCase()}${d.altitude ? ` · ${Math.round(d.altitude / 100) * 100}ft` : ''}${d.speed ? ` · ${Math.round(d.speed)}kts` : ''}
        </span>
      </div>`)
      .onPointClick(d => setSelectedFlight(d));

    if (gpsHexes.length > 0) {
      globe
        .ringsData(gpsHexes)
        .ringLat('lat')
        .ringLng('lng')
        .ringColor(() => '#facc15')
        .ringMaxRadius(1.2)
        .ringPropagationSpeed(1)
        .ringRepeatPeriod(900);
    }
  }, [data]);

  const totalFlights = data?.meta?.totalFlights ?? data?.flights?.length ?? 0;
  const milCount = data?.meta?.militaryCount ?? data?.militaryFlights?.length ?? 0;
  const jamCount = data?.meta?.jamCount ?? data?.gpsJam?.hexes?.length ?? 0;

  return (
    <div className="relative w-full h-full bg-[#070b14]">
      <div ref={globeRef} className="w-full h-full" />

      {/* Loading overlay */}
      {(!GlobeGL || isLoading) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-400 text-xs font-mono">INITIALIZING GLOBE...</p>
          </div>
        </div>
      )}

      {/* Stats overlay */}
      {data && (
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
          <div className="bg-slate-900/80 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-slate-300">
            ✈️ {totalFlights.toLocaleString()} flights tracked
          </div>
          {milCount > 0 && (
            <div className="bg-orange-900/80 border border-orange-700 rounded px-2 py-1 text-[10px] font-mono text-orange-300">
              🔴 {milCount} military
            </div>
          )}
          {jamCount > 0 && (
            <div className="bg-yellow-900/80 border border-yellow-700 rounded px-2 py-1 text-[10px] font-mono text-yellow-300">
              📡 {jamCount} GPS jam zones
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-[9px] font-mono text-slate-400 pointer-events-none space-y-0.5">
        <div><span className="text-orange-400">●</span> Military</div>
        <div><span className="text-blue-400">●</span> Civil Aviation</div>
        {jamCount > 0 && <div><span className="text-yellow-400">◉</span> GPS Jamming</div>}
      </div>

      {/* Flight detail panel */}
      {selectedFlight && (
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-600 rounded-lg p-3 text-xs font-mono text-slate-200 max-w-52 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className={`font-bold ${selectedFlight.isMilitary ? 'text-orange-400' : 'text-sky-400'}`}>
              {selectedFlight.label}
            </span>
            <button onClick={() => setSelectedFlight(null)} className="text-slate-500 hover:text-white ml-2">✕</button>
          </div>
          <div className="text-slate-400 text-[10px] space-y-0.5">
            <div>ICAO: {selectedFlight.icao24?.toUpperCase()}</div>
            {selectedFlight.altitude && <div>Alt: {selectedFlight.altitude.toLocaleString()} ft</div>}
            {selectedFlight.speed && <div>Speed: {Math.round(selectedFlight.speed)} kts</div>}
            {selectedFlight.heading && <div>Hdg: {Math.round(selectedFlight.heading)}°</div>}
            {selectedFlight.isMilitary && <div className="text-orange-400">⚠ MILITARY</div>}
            {detailData?.detail?.registration && <div>Reg: {detailData.detail.registration}</div>}
            {detailData?.detail?.model && <div>Type: {detailData.detail.model}</div>}
            {detailData?.detail?.operator && <div>Op: {detailData.detail.operator}</div>}
          </div>
        </div>
      )}
    </div>
  );
}