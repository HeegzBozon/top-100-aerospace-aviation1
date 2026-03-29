import { useEffect, useRef, useState } from 'react';
import { useGlobeIntelLive, useGlobeFlightDetail } from '@/lib/intelligence/globeHooks';

const MILITARY_HEX_PREFIXES = ['AE', 'A0', '43', '44', '45', '46', '47', '48', '3C', '3D', '3E', '3F', '50', '51', '52'];

function isMilitary(icao24) {
  const hex = (icao24 || '').toUpperCase();
  return MILITARY_HEX_PREFIXES.some(p => hex.startsWith(p));
}

export function WorldMonitorGlobe() {
  const globeRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [GlobeGL, setGlobeGL] = useState(null);

  const { data, isLoading } = useGlobeIntelLive();
  const { data: detailData } = useGlobeFlightDetail(selectedFlight?.icao24);

  // Lazy-load globe.gl (heavy 3D library)
  useEffect(() => {
    import('globe.gl').then(m => setGlobeGL(() => m.default));
  }, []);

  // Initialize globe
  useEffect(() => {
    if (!GlobeGL || !globeRef.current) return;

    const globe = GlobeGL()(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .width(globeRef.current.clientWidth || 600)
      .height(globeRef.current.clientHeight || 400)
      .atmosphereColor('#1a4a8a')
      .atmosphereAltitude(0.15)
      .pointOfView({ lat: 20, lng: 0, altitude: 2.2 });

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

  // Update flight points
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !data) return;

    // Military flights from OpenSky
    const openSkyFlights = (data.openSky?.flights || []).map(f => ({
      lat: f.lat, lng: f.lon,
      label: f.callsign || f.icao24,
      icao24: f.icao24,
      color: '#ef4444',
      size: 0.6,
      source: 'opensky',
    }));

    // Wingbits flights — flatten all regions
    const wingbitsFlights = [];
    const wbData = data.wingbitsFlights || [];
    for (const region of wbData) {
      for (const f of (region.data || [])) {
        if (f.la && f.lo && !f.og) {
          wingbitsFlights.push({
            lat: f.la, lng: f.lo,
            label: f.f || f.h,
            icao24: f.h,
            color: isMilitary(f.h) ? '#f97316' : '#60a5fa',
            size: isMilitary(f.h) ? 0.6 : 0.35,
            source: 'wingbits',
          });
        }
      }
    }

    // GPS jamming hexes
    const gpsHexes = (data.gpsJam?.hexes || []).slice(0, 500).map(h => ({
      lat: h.lat ?? h.center?.[0],
      lng: h.lng ?? h.center?.[1],
    })).filter(h => h.lat && h.lng);

    const allFlights = [...openSkyFlights, ...wingbitsFlights];

    globe
      .pointsData(allFlights)
      .pointLat('lat')
      .pointLng('lng')
      .pointColor('color')
      .pointRadius('size')
      .pointAltitude(0.01)
      .pointLabel(d => `<div style="background:#1e293b;color:#e2e8f0;padding:6px 10px;border-radius:6px;font-family:monospace;font-size:12px;border:1px solid #334155">
        ${d.source === 'wingbits' ? '⚡' : '✈️'} <b>${d.label}</b><br/>
        ${d.icao24?.toUpperCase()}</div>`)
      .onPointClick(d => setSelectedFlight(d));

    // GPS jamming rings
    if (gpsHexes.length > 0) {
      globe
        .ringsData(gpsHexes.slice(0, 100))
        .ringLat('lat')
        .ringLng('lng')
        .ringColor(() => '#facc15')
        .ringMaxRadius(1.5)
        .ringPropagationSpeed(1)
        .ringRepeatPeriod(800);
    }
  }, [data]);

  const totalFlights = (data?.openSky?.flights?.length || 0) +
    (data?.wingbitsFlights || []).reduce((acc, r) => acc + (r.data?.length || 0), 0);
  const jamCount = data?.gpsJam?.hexes?.length || 0;

  return (
    <div className="relative w-full h-full bg-[#070b14]">
      {/* Globe container */}
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
            ✈️ {totalFlights} flights tracked
          </div>
          {jamCount > 0 && (
            <div className="bg-yellow-900/80 border border-yellow-700 rounded px-2 py-1 text-[10px] font-mono text-yellow-300">
              📡 {jamCount} GPS jam zones
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 left-2 bg-slate-900/80 border border-slate-700 rounded px-2 py-1.5 text-[9px] font-mono text-slate-400 pointer-events-none space-y-0.5">
        <div><span className="text-red-400">●</span> OpenSky Military</div>
        <div><span className="text-orange-400">●</span> Wingbits Military</div>
        <div><span className="text-blue-400">●</span> Wingbits Civil</div>
        <div><span className="text-yellow-400">◉</span> GPS Jamming</div>
      </div>

      {/* Flight detail panel */}
      {selectedFlight && (
        <div className="absolute top-2 right-2 bg-slate-900/90 border border-slate-600 rounded-lg p-3 text-xs font-mono text-slate-200 max-w-48 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sky-400 font-bold">{selectedFlight.label}</span>
            <button onClick={() => setSelectedFlight(null)} className="text-slate-500 hover:text-white ml-2">✕</button>
          </div>
          <div className="text-slate-400 text-[10px] space-y-0.5">
            <div>ICAO: {selectedFlight.icao24?.toUpperCase()}</div>
            <div>Source: {selectedFlight.source}</div>
            {detailData?.detail && (
              <>
                {detailData.detail.registration && <div>Reg: {detailData.detail.registration}</div>}
                {detailData.detail.model && <div>Type: {detailData.detail.model}</div>}
                {detailData.detail.operator && <div>Op: {detailData.detail.operator}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}