import { useEffect, useRef, useState } from 'react';
import { useGlobeIntelLive } from '@/lib/intelligence/globeHooks';
import FlightDetailCard from './FlightDetailCard';

export function WorldMonitorGlobe() {
  const globeRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [GlobeGL, setGlobeGL] = useState(null);

  const { data, isLoading } = useGlobeIntelLive();

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

  // Update flights as HTML elements (plane icons) + GPS jam rings
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe || !data) return;

    const flights = (data.flights || []).map(f => ({
      lat:        f.lat,
      lng:        f.lon,
      label:      f.callsign || f.icao24,
      icao24:     f.icao24,
      callsign:   f.callsign,
      isMilitary: f.isMilitary,
      anomaly:    f.anomaly,
      altitude:   f.altitude,
      speed:      f.speed,
      heading:    f.heading,
      country:    f.country,
      sources:    f.sources,
      anomalyDetails: f.anomalyDetails,
    }));

    // ── Plane HTML elements ───────────────────────────────────────────────────
    globe
      .htmlElementsData(flights)
      .htmlLat('lat')
      .htmlLng('lng')
      .htmlAltitude(0.005)
      .htmlElement(d => {
        const el = document.createElement('div');
        const color = d.isMilitary ? '#f97316' : d.anomaly ? '#ef4444' : '#60a5fa';
        const size  = d.isMilitary ? 14 : 11;
        const hdg   = d.heading ?? 0;
        el.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          color: ${color};
          font-size: ${size}px;
          line-height: 1;
          transform: rotate(${hdg}deg);
          cursor: pointer;
          filter: drop-shadow(0 0 3px ${color}88);
          transition: transform 0.3s ease;
          user-select: none;
        `;
        el.textContent = '✈';
        el.title = d.label || d.icao24;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedFlight(d);
        });
        return el;
      });

    // ── GPS Jamming rings ─────────────────────────────────────────────────────
    const gpsHexes = (data.gpsJam?.hexes || [])
      .filter(h => h.lat && h.lng)
      .slice(0, 300);

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
  const milCount     = data?.meta?.militaryCount ?? 0;
  const jamCount     = data?.meta?.jamCount ?? data?.gpsJam?.hexes?.length ?? 0;
  const corroborated = data?.meta?.corroborated ?? 0;
  const anomalies    = data?.meta?.anomalies ?? 0;

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
            ✈️ {totalFlights.toLocaleString()} flights
          </div>
          {corroborated > 0 && (
            <div className="bg-green-900/80 border border-green-700 rounded px-2 py-1 text-[10px] font-mono text-green-300">
              ✓ {corroborated} verified
            </div>
          )}
          {milCount > 0 && (
            <div className="bg-orange-900/80 border border-orange-700 rounded px-2 py-1 text-[10px] font-mono text-orange-300">
              🔴 {milCount} military
            </div>
          )}
          {anomalies > 0 && (
            <div className="bg-red-900/80 border border-red-700 rounded px-2 py-1 text-[10px] font-mono text-red-300">
              ⚠ {anomalies} anomalies
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
        <div><span className="text-orange-400">✈</span> Military</div>
        <div><span className="text-blue-400">✈</span> Civil Aviation</div>
        <div><span className="text-red-400">✈</span> Anomaly</div>
        {jamCount > 0 && <div><span className="text-yellow-400">◉</span> GPS Jamming</div>}
      </div>

      {/* Enhanced flight detail card */}
      <FlightDetailCard
        flight={selectedFlight}
        onClose={() => setSelectedFlight(null)}
      />
    </div>
  );
}