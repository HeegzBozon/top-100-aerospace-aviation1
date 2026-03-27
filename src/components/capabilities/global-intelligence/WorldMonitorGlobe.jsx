import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe as GlobeIcon, ChevronUp, ChevronDown, Loader2,
  Plane, Radio, Crosshair, Map, Satellite, Rocket, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useMilitaryFlights,
  useGpsJamming,
  useConflictEvents,
  useSatellites,
  useTheaterPosture,
  useWingbitsGpsJam,
  useWingbitsLiveFlights,
  useWingbitsFlightDetail,
  useWingbitsFlightPath,
} from '@/lib/intelligence/hooks';
import { cellToLatLng } from 'h3-js';
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
  { id: 'launches',   icon: Rocket,    label: 'Launches'  },
];

// ─── Launch site constants ──────────────────────────────────────────────────────
const LAUNCH_SITES = [
  { id: 'kennedy',    name: 'KSC',      lat: 28.3922,  lng: -80.6077  },
  { id: 'starbase',   name: 'StarBase', lat: 25.9969,  lng: -97.1572  },
  { id: 'vandenberg', name: 'VSFB',     lat: 34.7420,  lng: -120.5724 },
  { id: 'mahia',      name: 'Mahia',    lat: -39.2594, lng: 177.8645  },
];

// ══════════════════════════════════════════════════════════════════════════════
export function WorldMonitorGlobe() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [loaded,     setLoaded]     = useState(false);
  const [nowMin,     setNowMin]     = useState(() => Date.now() / 60000);
  const [layers,     setLayers]     = useState({
    flights: true, gps: true, conflicts: true, theaters: true, satellites: false, launches: false,
  });
  const [tooltip, setTooltip] = useState(null);

  const globeRef     = useRef(null);
  const containerRef = useRef(null);

  const { data: flightsData  } = useMilitaryFlights();
  const { data: gpsData      } = useGpsJamming();
  const { data: conflictData } = useConflictEvents({ limit: '200' });
  const { data: satData      } = useSatellites();
  const { data: theaterData  } = useTheaterPosture();

  const [selectedIcao24, setSelectedIcao24] = useState(null);
  const { data: wbFlightsRaw }  = useWingbitsLiveFlights();
  const { data: wbGpsData }      = useWingbitsGpsJam();
  const { data: wbDetailData }   = useWingbitsFlightDetail(selectedIcao24);
  const { data: wbPathData }     = useWingbitsFlightPath(selectedIcao24);

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
              .onPointClick(pt => {
                if (!pt) return;
                if (pt._launchSite) {
                  setTooltip({ type: 'launch', data: pt });
                  return;
                }
                if (pt._sat) {
                  setTooltip({ type: 'sat', data: pt });
                  return;
                }
                setTooltip({ type: 'flight', data: pt });
                if (pt._icao24) setSelectedIcao24(pt._icao24.toLowerCase());
              })
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

  // ─── Layer: flight points + satellite dots + launch sites (combined pointsData) ─
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !loaded) return;

    // ─── Wingbits live flights (flatten all aliases) ───
    const wbFlights = layers.flights && wbFlightsRaw
      ? wbFlightsRaw.flatMap(area => (area.data || []))
          .filter(f => !f.og && f.la && f.lo)
      : [];

    // ─── OpenSky military flights ───
    const osFlights = layers.flights
      ? (flightsData?.flights || [])
      : [];

    // ─── Merge: prefer Wingbits data (keyed by hex 'h'), OpenSky keyed by icao24 ───
    const wbHexes = new Set(wbFlights.map(f => f.h?.toLowerCase()).filter(Boolean));
    const mergedFlights = [
      ...wbFlights.map(f => {
        const isEmergency = ['7700', '7600', '7500'].includes(f.sq);
        return {
          lat: f.la, lng: f.lo,
          _alt: 0.01,
          size: isEmergency ? 0.5 : (f.ab ? Math.min(0.18 + f.ab / 110000, 0.5) : 0.28),
          color: isEmergency ? '#ef4444' : (COUNTRY_COLOR[f.country] || '#94a3b8'),
          label: TIP([
            `${isEmergency ? '🚨' : '✈'} <b>${esc(f.f || f.h || '')}</b>`,
            isEmergency ? `<span style="color:#f87171">SQUAWK ${f.sq}</span>` : '',
            f.ab ? `${f.ab.toLocaleString()} ft` : '',
            f.gs ? `${Math.round(f.gs)} kts` : '',
          ].filter(Boolean)),
          _icao24: f.h, _callsign: f.f, _altFt: f.ab, _speed: f.gs, _squawk: f.sq,
          _isEmergency: isEmergency, _source: 'wingbits',
        };
      }),
      ...osFlights
        .filter(f => !wbHexes.has((f.icao24 || '').toLowerCase()))
        .map(f => ({
          lat: f.lat, lng: f.lon,
          _alt: 0.01,
          size: f.altitudeFt ? Math.min(0.18 + f.altitudeFt / 110_000, 0.55) : 0.3,
          color: flightColor(f),
          label: TIP([
            `${f.operatorFlag || '✈'} <b>${esc(f.callsign || f.icao24)}</b>`,
            esc(f.operator || f.country || ''),
            f.altitudeFt ? `${f.altitudeFt.toLocaleString()} ft` : '',
          ].filter(Boolean)),
          _icao24: f.icao24, _callsign: f.callsign, _operator: f.operator,
          _country: f.country, _flag: f.operatorFlag, _altFt: f.altitudeFt,
          _source: 'opensky',
        })),
    ];

    // ─── Satellite points ───
    const satPts = layers.satellites
      ? (satData?.satellites || []).slice(0, 80).map(s => {
          const pos = satPos(s, nowMin);
          return {
            ...pos,
            _alt: Math.max(0.05, (s.alt || 400) / 6371),
            size: 0.08,
            color: satColor(s),
            label: TIP([`🛰 <b>${esc(s.name)}</b>`, esc(s.country), `${(s.alt || 0).toLocaleString()} km`]),
            _sat: true, _name: s.name, _satCountry: s.country, _satAlt: s.alt,
          };
        })
      : [];

    // ─── Launch site markers ───
    const launchPts = layers.launches
      ? LAUNCH_SITES.map(site => {
          const nearbyAlias = wbFlightsRaw?.find(a => a.alias === site.id);
          const count = nearbyAlias?.data?.filter(f => !f.og).length || 0;
          return {
            lat: site.lat, lng: site.lng,
            _alt: 0.005,
            size: 0.35,
            color: '#f59e0b',
            label: TIP([`🚀 <b>${site.name}</b>`, count > 0 ? `${count} aircraft in corridor` : 'Monitoring…']),
            _launchSite: true, _siteName: site.name, _siteCount: count,
          };
        })
      : [];

    const pts = [...mergedFlights, ...satPts, ...launchPts];
    g.pointsData(pts)
      .pointLat('lat').pointLng('lng')
      .pointAltitude('_alt')
      .pointRadius('size')
      .pointColor('color')
      .pointLabel('label');
  }, [flightsData, wbFlightsRaw, satData, loaded, layers.flights, layers.satellites, layers.launches, nowMin]);

  // ─── Layer: GPS jamming rings ──────────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !loaded) return;

    if (!layers.gps) {
      g.ringsData([]);
      return;
    }

    const rings = [];

    // ─── Wingbits real H3 sensor data ───
    const wbHexes = wbGpsData?.hexes || [];
    for (const hex of wbHexes) {
      if ((hex.sampleCount || 0) < 3) continue;
      const npAvg = hex.npAvg ?? 8;
      if (npAvg >= 8) continue;

      try {
        const [lat, lng] = cellToLatLng(hex.h3Index);
        const isSevere = npAvg < 2;
        const isMedium = npAvg < 4;
        rings.push({
          lat, lng,
          maxR:             isSevere ? 5.5 : isMedium ? 3.5 : 2.0,
          propagationSpeed: isSevere ? 3.2 : isMedium ? 2.0 : 1.5,
          repeatPeriod:     isSevere ? 600 : 800,
          color: t => isSevere
            ? `rgba(239,68,68,${Math.max(0, 1 - t * 1.4)})`
            : isMedium
            ? `rgba(245,158,11,${Math.max(0, 1 - t * 1.4)})`
            : `rgba(234,179,8,${Math.max(0, 1 - t * 1.6)})`,
          label: TIP([
            `⚡ GPS ${isSevere ? 'Severe Jam' : isMedium ? 'Jamming' : 'Degraded'}`,
            `NAC-p avg: ${npAvg.toFixed(1)}`,
            `${hex.aircraftCount || 0} aircraft / ${hex.sampleCount || 0} samples`,
          ]),
        });
      } catch {
        // invalid h3Index — skip
      }
    }

    // ─── Fallback: legacy static events if no Wingbits data ───
    if (rings.length === 0) {
      const fallback = (gpsData?.events || []).filter(e => e.lat && e.lon);
      for (const e of fallback) {
        rings.push({
          lat: e.lat, lng: e.lon,
          maxR: e.severity === 'high' ? 5.5 : e.severity === 'medium' ? 3.5 : 2,
          propagationSpeed: e.severity === 'high' ? 3.2 : 1.8,
          repeatPeriod: 700,
          color: t => `rgba(245,158,11,${Math.max(0, 1 - t * 1.4)})`,
          label: TIP([`⚡ GPS Jam`, e.region || '', e.severity || 'active']),
        });
      }
    }

    // ─── Emergency squawk rings (always added regardless of GPS layer toggle) ───
    const wbFlightsList = (wbFlightsRaw || []).flatMap(a => a.data || []);
    for (const f of wbFlightsList) {
      if (['7700', '7600', '7500'].includes(f.sq) && f.la && f.lo) {
        rings.push({
          lat: f.la, lng: f.lo,
          maxR: 4,
          propagationSpeed: 4,
          repeatPeriod: 400,
          color: t => `rgba(239,68,68,${Math.max(0, 1 - t * 1.2)})`,
          label: TIP([`🚨 EMERGENCY`, `Squawk ${f.sq}`, esc(f.f || f.h || '')]),
        });
      }
    }

    g.ringsData(rings)
      .ringLat('lat').ringLng('lng')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .ringColor('color');
  }, [wbGpsData, gpsData, wbFlightsRaw, loaded, layers.gps]);

  // ─── Layer: selected flight path ──────────────────────────────────────────
  useEffect(() => {
    const g = globeRef.current;
    if (!g || !loaded) return;
    if (!wbPathData?.flight?.path?.length) {
      if (typeof g.pathsData === 'function') g.pathsData([]);
      return;
    }
    if (typeof g.pathsData !== 'function') return;  // globe.gl version check

    const coords = wbPathData.flight.path.map(p => [p.latitude, p.longitude, Math.max(0, (p.altitude || 0) / 6371000 * 0.3)]);
    g.pathsData([{ coords, name: wbPathData.flight.name }])
      .pathPoints('coords')
      .pathPointLat(p => p[0])
      .pathPointLng(p => p[1])
      .pathPointAlt(p => p[2])
      .pathStroke(0.5)
      .pathColor(() => ['rgba(14,165,233,0)', 'rgba(14,165,233,0.9)'])
      .pathDashLength(0.1)
      .pathDashGap(0.008)
      .pathDashAnimateTime(12000);
  }, [wbPathData, loaded]);

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
  const gpsCount     = (wbGpsData?.hexes || []).filter(h => h.npAvg < 4 && (h.sampleCount || 0) >= 3).length
    || gpsData?.events?.length || 0;
  const conflictCount = (conflictData?.events || []).filter(e => e.fatalities > 2).length;
  const emergencyCount = (wbFlightsRaw || []).flatMap(a => a.data || [])
    .filter(f => ['7700', '7600', '7500'].includes(f.sq)).length;

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
            {emergencyCount > 0 && <StatPill color="text-red-400 animate-pulse" label={`🚨 ${emergencyCount} EMRG`} />}
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
                      {tooltip.data._isEmergency ? '🚨' : (tooltip.data._flag || '✈')}{' '}
                      {tooltip.data._callsign || tooltip.data._icao24}
                    </p>
                    {tooltip.data._isEmergency && (
                      <p className="text-red-400 font-semibold text-[10px] uppercase tracking-wide">
                        Emergency — Squawk {tooltip.data._squawk}
                      </p>
                    )}
                    <p className="text-slate-400">{tooltip.data._operator || tooltip.data._country}</p>
                    {tooltip.data._altFt && (
                      <p className="tabular-nums">{tooltip.data._altFt.toLocaleString()} ft</p>
                    )}
                    {tooltip.data._speed && (
                      <p className="tabular-nums text-slate-400">{Math.round(tooltip.data._speed)} kts</p>
                    )}
                    {wbDetailData?.flight && (
                      <div className="mt-1 pt-1 border-t border-slate-600/50 text-[10px] text-slate-400">
                        <p>{wbDetailData.flight.model || ''} {wbDetailData.flight.typecode ? `· ${wbDetailData.flight.typecode}` : ''}</p>
                        <p>{wbDetailData.flight.operator || ''}</p>
                      </div>
                    )}
                    {wbPathData?.flight?.path?.length > 0 && (
                      <p className="text-[10px] text-sky-400 mt-1">↗ Path tracked ({wbPathData.flight.path.length} pts)</p>
                    )}
                    <p className="text-slate-500 font-mono text-[10px]">{(tooltip.data._icao24 || '').toUpperCase()}</p>
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

                {tooltip.type === 'launch' && (
                  <div className="space-y-0.5">
                    <p className="font-semibold text-amber-300">🚀 {tooltip.data._siteName}</p>
                    <p className="text-slate-300">{tooltip.data._siteCount > 0 ? `${tooltip.data._siteCount} aircraft in corridor` : 'Monitoring…'}</p>
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