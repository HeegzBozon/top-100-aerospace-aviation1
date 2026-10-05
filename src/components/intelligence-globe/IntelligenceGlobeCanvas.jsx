import { useEffect, useRef, useState } from 'react';

const EARTH_RADIUS = 6371; // km

// Color helpers — brand palette: navy (#1E3A5A), gold (#C9A87C), copper (#B87333), cream (#FAF8F5)
const SAT_COLORS = {
  stations: '#C9A87C', visual: '#FAF8F5', weather: '#B87333', gps: '#1E3A5A',
  iridium: '#E8CF9E', noaa: '#B87333', starlink: '#D4C4A8',
};

function flightColor(f) {
  if (f.emergency && f.emergency !== 'none') return '#ef4444';
  if (f.mil) return '#B87333';
  return '#7BA3C7';
}

function quakeColor(e) {
  if (e.mag >= 5) return '#ef4444';
  if (e.mag >= 4) return '#B87333';
  return '#C9A87C';
}

function quakeRadius(e) {
  return Math.max(0.15, Math.min(e.mag * 0.12, 0.8));
}

function satAltitude(altKm) {
  return Math.min(altKm / EARTH_RADIUS, 0.35);
}

export default function IntelligenceGlobeCanvas({
  data, layers, onSelect, selected,
}) {
  const globeRef = useRef(null);
  const instanceRef = useRef(null);
  const [GlobeGL, setGlobeGL] = useState(null);

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
      .atmosphereColor('#1E3A5A')
      .atmosphereAltitude(0.18)
      .pointOfView({ lat: 25, lng: 0, altitude: 2.2 })
      .showAtmosphere(true);

    instanceRef.current = globe;

    // Auto-rotate
    let rotating = true;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;

    // Stop rotation on interaction
    const stopRotate = () => { controls.autoRotate = false; };
    const startRotate = () => { controls.autoRotate = true; };
    globeRef.current.addEventListener('pointerdown', stopRotate);
    globeRef.current.addEventListener('pointerup', startRotate);

    const handleResize = () => {
      if (globeRef.current) {
        globe.width(globeRef.current.clientWidth);
        globe.height(globeRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      globeRef.current?.removeEventListener('pointerdown', stopRotate);
      globeRef.current?.removeEventListener('pointerup', startRotate);
      globe._destructor?.();
    };
  }, [GlobeGL]);

  // Update flights as HTML elements
  useEffect(() => {
    const globe = instanceRef.current;
    if (!globe || !data) return;

    const flights = (layers.flights && data.flights?.flights) || [];
    const elements = flights.filter(f => f.lat != null && f.lon != null).map(f => ({
      lat: f.lat, lng: f.lon, alt: 0.008, data: f, type: 'flight',
    }));

    globe
      .htmlElementsData(elements)
      .htmlLat('lat').htmlLng('lng').htmlAltitude('alt')
      .htmlElement(d => {
        const el = document.createElement('div');
        const color = flightColor(d.data);
        const size = d.data.mil ? 13 : 10;
        el.style.cssText = `width:${size}px;height:${size}px;color:${color};font-size:${size}px;line-height:1;transform:rotate(${d.data.track || 0}deg);cursor:pointer;filter:drop-shadow(0 0 3px ${color}88);user-select:none;`;
        el.textContent = '✈';
        el.title = d.data.flight || d.data.icao;
        el.addEventListener('click', e => { e.stopPropagation(); onSelect({ type: 'flight', data: d.data }); });
        return el;
      });
  }, [data, layers.flights, onSelect]);

  // Update points (satellites + earthquakes + news combined)
  useEffect(() => {
    const globe = instanceRef.current;
    if (!globe || !data) return;

    const points = [];

    // Satellites
    if (layers.satellites) {
      for (const s of (data.satellites?.satellites || [])) {
        if (s.lat == null || s.lon == null) continue;
        points.push({
          lat: s.lat, lng: s.lon,
          alt: satAltitude(s.alt),
          color: SAT_COLORS[s.group] || '#D4C4A8',
          radius: s.group === 'stations' ? 0.35 : 0.22,
          type: 'satellite', data: s,
        });
      }
    }

    // Earthquakes
    if (layers.earthquakes) {
      for (const e of (data.earthquakes?.earthquakes || [])) {
        if (e.lat == null || e.lon == null) continue;
        points.push({
          lat: e.lat, lng: e.lon, alt: 0.005,
          color: quakeColor(e),
          radius: quakeRadius(e),
          type: 'earthquake', data: e,
        });
      }
    }

    // News
    if (layers.news) {
      for (const n of (data.news?.articles || [])) {
        if (n.lat == null || n.lon == null) continue;
        points.push({
          lat: n.lat, lng: n.lon, alt: 0.003,
          color: '#FAF8F5',
          radius: 0.12,
          type: 'news', data: n,
        });
      }
    }

    globe
      .pointsData(points)
      .pointLat('lat').pointLng('lng').pointAltitude('alt')
      .pointColor('color').pointRadius('radius')
      .onPointClick(p => onSelect({ type: p.type, data: p.data }));

    // Launches as rings
    const launchSites = (layers.launches && data.launches?.launches) || [];
    const rings = launchSites.map(l => ({
      lat: l.pad.lat, lng: l.pad.lon, data: l, type: 'launch',
    }));
    globe
      .ringsData(rings)
      .ringLat('lat').ringLng('lng')
      .ringColor(() => t => `rgba(201, 168, 124, ${1 - t})`)
      .ringMaxRadius(2).ringPropagationSpeed(0.8).ringRepeatPeriod(1200)
      .onRingClick(r => onSelect({ type: 'launch', data: r.data }));
  }, [data, layers, onSelect]);

  return (
    <div className="relative w-full h-full bg-[#070b14]">
      <div ref={globeRef} className="w-full h-full" />
      {!GlobeGL && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#C9A87C] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}