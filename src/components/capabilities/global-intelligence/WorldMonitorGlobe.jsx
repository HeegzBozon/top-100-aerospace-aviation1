import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe as GlobeIcon, ChevronUp, ChevronDown, Loader2,
  Plane, Radio, Crosshair, Map, Satellite,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useMilitaryFlights,
  useGpsJamming,
  useConflictEvents,
  useSatellites,
  useTheaterPosture,
} from '@/lib/intelligence/hooks';
import { THEATER_DEFS } from '@/lib/intelligence/constants';

function theaterPolygon({ id, color, bounds }) {
  const [w, s, e, n] = bounds;
  return {
    geometry: { type: 'Polygon', coordinates: [[[w,s],[e,s],[e,n],[w,n],[w,s]]] },
    properties: { id, color },
  };
}

// ─── Color maps ────────────────────────────────────────────────────────────────
const COUNTRY_COLOR = {
  USA:'#ef4444', GBR:'#3b82f6', FRA:'#6366f1', DEU:'#64748b',
  AUS:'#f59e0b', NATO:'#0ea5e9', RUS:'#dc2626', CHN:'#f97316',
  ISR:'#8b5cf6', IND:'#f97316', JPN:'#0284c7', KOR:'#16a34a',
  PAK:'#84cc16', TUR:'#06b6d4',
};
const SAT_COLOR = { military:'#ef4444', sar:'#f59e0b', communication:'#3b82f6', optical:'#10b981' };
const flightColor = f => COUNTRY_COLOR[f.operatorCountry] || '#94a3b8';
const satColor    = s => SAT_COLOR[s.type] || '#64748b';

// ─── Approximate satellite position (visualization-grade, not TLE-accurate) ───
// Each satellite gets a deterministic RAAN seed so positions are stable across renders.
function satPos(sat, nowMin) {
  const period = sat.period || 92;
  const inc    = sat.inclination || 51.6;
  const phase  = ((nowMin % period) / period) * 2 * Math.PI;
  const raan   = (sat.id * 13.71) % 360;
  return {
    lat: inc * Math.sin(phase),
    lng: ((raan + (nowMin / period) * 360) % 360) - 180,
  };
}

// ─── Escape user-sourced strings before injecting into TIP() HTML ─────────────
const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// ─── Tooltip HTML builder ──────────────────────────────────────────────────────
const TIP = (lines) =>
  `<div style="background:#1e293b;color:#f1f5f9;padding:6px 10px;border-radius:8px;font-size:12px;font-family:sans-serif;line-height:1.5;max-width:180px">${lines.join('<br>')}</div>`;

// ─── Layer definitions ─────────────────────────────────────────────────────────
const LAYER_DEFS = [
  { id: 'flights',    icon: Plane,     label: 'Flights'   },
  { id: 'gps',        icon: Radio,     label: 'GPS Jam'   },
  { id: 'conflicts',  icon: Crosshair, label: 'Conflicts' },
  { id: 'theaters',   icon: Map,       label: 'Theaters'  },
  { id: 'satellites', icon: Satellite, label: 'Sats'      },
];

// ══════════════════════════════════════════════════════════════════════════════
export function WorldMonitorGlobe() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [loaded,     setLoaded]     = useState(false);
  const [nowMin,     setNowMin]     = useState(() => Date.now() / 60000);
  const [layers,     setLayers]     = useState({
    flights: true, gps: true, conflicts: true, theaters: true, satellites: false,
  });
  const [tooltip, setTooltip] = useState(null);

  const globeRef     = useRef(null);
  const containerRef = useRef(null);

  const { data: flightsData  } = useMilitaryFlights();
  const { data: gpsData      } = useGpsJamming();
  const { data: conflictData } = useConflictEvents({ limit: '200' });
  const { data: satData      } = useSatellites();
  const { data: theaterData  } = useTheaterPosture();

  // Animate satellite positions every 30 s
  useEffect(() => {
    const id = setInterval(() => setNowMin(Date.now() / 60000), 30_000);
    return () => clearInterval(id);
  }, []);

  // ─── Globe initialisation ──────────────────────────────────────────────────
  useEffect(() => {
    if (collapsed || loaded) return;
    let cancelled = false;

    import('globe.gl').then(GlobeModule => {
      if (cancelled || !containerRef.current) return;

      // Handle both ESM default and CJS exports
      const GlobeGL = GlobeModule.default || GlobeModule;

      try {
        const g = GlobeGL()
          .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
          .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
          .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
          .width(containerRef.current.clientWidth || 800)
          .height(500)
          .atmosphereColor('#4a90b8')
          .atmosphereAltitude(0.18)
          .enablePointerInteraction(false)
          .pointOfView({ lat: 25, lng: 10, altitude: 2.0 });

        g(containerRef.current);
        globeRef.current = g;

        // Re-enable pointer interaction after scene geometry is fully loaded
        // to prevent Three.js raycaster from hitting uninitialized BufferGeometry
        setTimeout(() => {
          if (!cancelled && globeRef.current) {
            globeRef.current
              .enablePointerInteraction(true)
              .onPointClick(pt => pt && setTooltip({ type: pt._sat ? 'sat' : 'flight', data: pt }))
              .onPolygonClick(p => p && setTooltip({ type: 'theater', data: p.properties }));

            if (typeof globeRef.current.onHexBinClick === 'function') {
              globeRef.current.onHexBinClick(hex => hex && setTooltip({
                type: 'conflict',
                data: { count: hex.points?.length || 0, fatalities: Math.round(hex.sumWeight || 0) },
              }));
            }
          }
        }, 2500);
      } catch (err) {
        console.error('[Globe] setup error:', err);
      }

      // Always clear loading state — even if setup partially failed
      setLoaded(true);
    }).catch(err => {
      console.warn('[Globe] import error:', err);
      setLoaded(true);
    });

    return () => { cancelled = true; };
  }, [collapsed]);

  // ─── Layer: flight points + satellite dots (combined pointsData) ───────────
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !loaded) return;

    const flightPts = layers.flights
      ? (flightsData?.flights || []).map(f => ({
          lat: f.lat, lng: f.lon,
          // Altitude stays at surface; radius scales with altitude
          _alt: 0.01,
          size: f.altitudeFt ? Math.min(0.18 + f.altitudeFt / 110_000, 0.55) : 0.3,
          color: flightColor(f),
          label: TIP([
            `${f.operatorFlag || '✈'} <b>${esc(f.callsign || f.icao24)}</b>`,
            esc(f.operator || f.country || ''),
            f.altitudeFt ? `${f.altitudeFt.toLocaleString()} ft` : '',
          ].filter(Boolean)),
          // Passthrough for tooltip
          _icao24: f.icao24, _callsign: f.callsign, _operator: f.operator,
          _country: f.country, _flag: f.operatorFlag, _altFt: f.altitudeFt,
        }))
      : [];

    const satPts = layers.satellites
      ? (satData?.satellites || []).slice(0, 80).map(s => {
          const pos = satPos(s, nowMin);
          return {
            ...pos,
            _alt: Math.max(0.05, (s.alt || 400) / 6371), // float at orbital altitude
            size: 0.08,
            color: satColor(s),
            label: TIP([`🛰 <b>${esc(s.name)}</b>`, esc(s.country), `${(s.alt || 0).toLocaleString()} km`]),
            _sat: true, _name: s.name, _satCountry: s.country, _satAlt: s.alt,
          };
        })
      : [];

    const pts = [...flightPts, ...satPts];
    g.pointsData(pts)
      .pointLat('lat').pointLng('lng')
      .pointAltitude('_alt')
      .pointRadius('size')
      .pointColor('color')
      .pointLabel('label');
  }, [flightsData, satData, loaded, layers.flights, layers.satellites, nowMin]);

  // ─── Layer: GPS jamming rings ──────────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !loaded) return;

    const rings = layers.gps
      ? (gpsData?.events || []).filter(e => e.lat && e.lon).map(e => ({
          lat: e.lat, lng: e.lon,
          maxR:              e.severity === 'high' ? 5.5 : e.severity === 'medium' ? 3.5 : 2,
          propagationSpeed:  e.severity === 'high' ? 3.2 : 1.8,
          repeatPeriod:      700,
          color: t => `rgba(245,158,11,${Math.max(0, 1 - t * 1.4)})`,
          label: TIP([`⚡ GPS Jam`, e.region || '', e.severity || 'active']),
        }))
      : [];

    g.ringsData(rings)
      .ringLat('lat').ringLng('lng')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .ringColor('color');
  }, [gpsData, loaded, layers.gps]);

  // ─── Layer: conflict hex-bin columns ──────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !loaded) return;

    const pts = layers.conflicts
      ? (conflictData?.events || [])
          .filter(e => e.location?.latitude && e.location?.longitude)
          .map(e => ({
            lat:    e.location.latitude,
            lng:    e.location.longitude,
            weight: Math.max(1, e.fatalities || 1),
          }))
      : [];

    g.hexBinPointsData(pts)
      .hexBinPointLat('lat')
      .hexBinPointLng('lng')
      .hexBinPointWeight('weight')
      .hexBinResolution(3)
      .hexAltitude(d => Math.min(d.sumWeight * 0.001, 0.16))
      .hexTopColor(d  => `rgba(220,38,38,${Math.min(0.92, 0.25 + d.sumWeight * 0.06)})`)
      .hexSideColor(d => `rgba(220,38,38,${Math.min(0.55, 0.10 + d.sumWeight * 0.03)})`);
  }, [conflictData, loaded, layers.conflicts]);

  // ─── Layer: theater boundary polygons ─────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !loaded) return;

    const postureMap = {};
    (theaterData?.theaters || []).forEach(t => { postureMap[t.theater] = t; });

    const polygons = layers.theaters
      ? THEATER_DEFS.map(def => {
          const theater = postureMap[def.id];
          const posture = theater?.postureLevel || 'normal';
          const opacity = posture === 'heightened' ? '28' : posture === 'raised' ? '18' : '0e';
          const poly    = theaterPolygon(def);
          poly.properties.capColor  = def.color + opacity;
          poly.properties.sideColor = def.color + '08';
          poly.properties.posture   = posture;
          poly.properties.flights   = theater?.activeFlights || 0;
          return poly;
        })
      : [];

    g.polygonsData(polygons)
      .polygonGeoJsonGeometry('geometry')
      .polygonAltitude(0.004)
      .polygonCapColor(d  => d.properties.capColor)
      .polygonSideColor(d => d.properties.sideColor)
      .polygonLabel(d => TIP([
        `<b>${d.properties.id}</b>`,
        `Posture: <span style="color:${
          d.properties.posture === 'heightened' ? '#f87171'
          : d.properties.posture === 'raised'   ? '#fbbf24'
          : '#34d399'
        }">${d.properties.posture}</span>`,
        d.properties.flights ? `${d.properties.flights} active flights` : '',
      ].filter(Boolean)));
  }, [theaterData, loaded, layers.theaters]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const flightCount  = flightsData?.flights?.length || 0;
  const gpsCount     = gpsData?.events?.length || 0;
  const conflictCount = (conflictData?.events || []).filter(e => e.fatalities > 2).length;

  const toggleLayer = id => setLayers(l => ({ ...l, [id]: !l[id] }));

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-lg bg-slate-900">

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <GlobeIcon className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Live Global Intelligence Map
          </span>
          {!loaded && !collapsed && (
            <span className="text-xs text-slate-400 animate-pulse ml-1">Initializing…</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3">
            {flightCount  > 0 && <StatPill color="text-red-400"    label={`${flightCount} flights`}   />}
            {gpsCount     > 0 && <StatPill color="text-amber-400"  label={`${gpsCount} GPS`}          />}
            {conflictCount> 0 && <StatPill color="text-rose-500"   label={`${conflictCount} conflicts`}/>}
          </div>
          <Button
            variant="ghost" size="sm"
            onClick={() => setCollapsed(c => !c)}
            className="text-slate-400 hover:text-white h-6 px-2"
          >
            {collapsed
              ? <><ChevronDown className="w-4 h-4" /><span className="text-xs ml-1">Expand</span></>
              : <><ChevronUp   className="w-4 h-4" /><span className="text-xs ml-1">Collapse</span></>
            }
          </Button>
        </div>
      </div>

      {/* ── Globe canvas ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 500 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative overflow-hidden"
          >
            {/* Loading overlay */}
            {!loaded && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-slate-900"
                style={{ zIndex: 2 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
                  <p className="text-sm text-slate-400">Initializing Globe…</p>
                </div>
              </div>
            )}

            <div ref={containerRef} style={{ height: 500 }} />

            {/* Layer toggle controls */}
            {loaded && (
              <div
                className="absolute bottom-3 left-3 flex flex-wrap gap-1.5"
                style={{ zIndex: 3 }}
              >
                {LAYER_DEFS.map(({ id, icon: Icon, label }) => (
                  <button
                    key={id}
                    onClick={() => toggleLayer(id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                      layers[id]
                        ? 'bg-slate-700/90 border-sky-500/50 text-sky-300'
                        : 'bg-slate-900/70 border-slate-600/40 text-slate-500'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* Click tooltip */}
            {tooltip && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-3 right-3 bg-slate-800/95 border border-slate-600/50 rounded-xl p-3 text-xs text-slate-200 shadow-xl"
                style={{ zIndex: 4, minWidth: 140, maxWidth: 200 }}
              >
                <button
                  onClick={() => setTooltip(null)}
                  className="absolute top-1.5 right-2 text-slate-500 hover:text-white leading-none"
                >✕</button>

                {tooltip.type === 'flight' && (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sky-300">
                      {tooltip.data._flag || '✈'} {tooltip.data._callsign || tooltip.data._icao24}
                    </p>
                    <p className="text-slate-400">{tooltip.data._operator || tooltip.data._country}</p>
                    {tooltip.data._altFt && (
                      <p className="tabular-nums">{tooltip.data._altFt.toLocaleString()} ft</p>
                    )}
                    <p className="text-slate-500 font-mono text-[10px]">{tooltip.data._icao24?.toUpperCase()}</p>
                  </div>
                )}

                {tooltip.type === 'sat' && (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-indigo-300">🛰 {tooltip.data._name}</p>
                    <p className="text-slate-400">{tooltip.data._satCountry}</p>
                    {tooltip.data._satAlt && (
                      <p className="tabular-nums">{tooltip.data._satAlt.toLocaleString()} km altitude</p>
                    )}
                  </div>
                )}

                {tooltip.type === 'conflict' && (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-red-300">💥 Conflict Zone</p>
                    <p className="text-slate-300">{tooltip.data.count} events</p>
                    <p className="text-slate-400">{tooltip.data.fatalities} fatalities</p>
                  </div>
                )}

                {tooltip.type === 'theater' && (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-blue-300">🎯 {tooltip.data.id}</p>
                    <p className="text-slate-300 capitalize">Posture: {tooltip.data.posture || 'normal'}</p>
                    {tooltip.data.flights > 0 && (
                      <p className="text-slate-400">{tooltip.data.flights} active flights</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatPill({ color, label }) {
  return <span className={`text-xs font-medium ${color}`}>{label}</span>;
}