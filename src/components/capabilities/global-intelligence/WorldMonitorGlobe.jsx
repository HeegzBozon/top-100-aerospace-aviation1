import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMilitaryFlights } from '@/lib/intelligence/hooks';
import { useGpsJamming } from '@/lib/intelligence/hooks';
import { useConflictEvents } from '@/lib/intelligence/hooks';

// Color by operator flag / country
const OPERATOR_COLORS = {
  USA:  '#ef4444',  // red
  GBR:  '#3b82f6',  // blue
  FRA:  '#6366f1',  // indigo
  DEU:  '#64748b',  // gray
  AUS:  '#f59e0b',  // amber
  NATO: '#0ea5e9',  // sky
};

function flightColor(flight) {
  return OPERATOR_COLORS[flight.operatorCountry] || '#94a3b8';
}

export function WorldMonitorGlobe() {
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const globeRef = useRef(null);
  const containerRef = useRef(null);
  const { data: flightsData } = useMilitaryFlights();
  const { data: gpsData } = useGpsJamming();
  const { data: conflictData } = useConflictEvents({ limit: '100' });

  // Initialize globe once
  useEffect(() => {
    if (collapsed || loaded) return;
    let globe = null;
    let cancelled = false;

    import('globe.gl').then(({ default: Globe }) => {
      if (cancelled || !containerRef.current) return;

      globe = Globe()
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(containerRef.current.clientWidth)
        .height(480)
        .atmosphereColor('#4a90b8')
        .atmosphereAltitude(0.15)
        .pointOfView({ lat: 30, lng: 20, altitude: 2.2 });

      globe(containerRef.current);
      globeRef.current = globe;
      setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [collapsed]);

  // Update flight points layer
  useEffect(() => {
    if (!globeRef.current || !loaded) return;
    const flights = (flightsData?.flights || []).map(f => ({
      lat: f.lat,
      lng: f.lon,
      size: 0.35,
      color: flightColor(f),
      label: `${f.operatorFlag || '✈'} ${f.callsign || f.icao24} · ${f.operator || f.country || ''}`,
    }));
    globeRef.current
      .pointsData(flights)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude(() => 0.01)
      .pointRadius('size')
      .pointColor('color')
      .pointLabel('label');
  }, [flightsData, loaded]);

  // Update GPS jamming rings layer
  useEffect(() => {
    if (!globeRef.current || !loaded) return;
    const rings = (gpsData?.events || []).map(e => ({
      lat: e.lat,
      lng: e.lon,
      maxR: e.severity === 'high' ? 4 : e.severity === 'medium' ? 2.5 : 1.5,
      propagationSpeed: e.severity === 'high' ? 2.5 : 1.5,
      repeatPeriod: 900,
      color: e.severity === 'high'
        ? t => `rgba(245,158,11,${1 - t})`
        : t => `rgba(234,179,8,${1 - t})`,
      label: `⚡ ${e.region} — ${e.type}`,
    }));
    globeRef.current
      .ringsData(rings)
      .ringLat('lat')
      .ringLng('lng')
      .ringMaxRadius('maxR')
      .ringPropagationSpeed('propagationSpeed')
      .ringRepeatPeriod('repeatPeriod')
      .ringColor('color');
  }, [gpsData, loaded]);

  // Update conflict arcs layer
  useEffect(() => {
    if (!globeRef.current || !loaded) return;
    const events = conflictData?.events || [];
    // Build arcs: connect high-fatality events to their capital/center (simple self-arc for marker)
    // Using arcs between the top events by fatalities as cross-theater links
    const hotspots = events
      .filter(e => e.fatalities > 5 && e.location?.latitude && e.location?.longitude)
      .slice(0, 20);

    const arcs = hotspots.slice(0, 10).map((e, i) => ({
      startLat: e.location.latitude,
      startLng: e.location.longitude,
      endLat: e.location.latitude + (Math.random() - 0.5) * 8,
      endLng: e.location.longitude + (Math.random() - 0.5) * 8,
      color: ['rgba(239,68,68,0.6)', 'rgba(239,68,68,0.1)'],
      label: `${e.country} · ${e.eventType} · ${e.fatalities} fatalities`,
    }));

    globeRef.current
      .arcsData(arcs)
      .arcStartLat('startLat')
      .arcStartLng('startLng')
      .arcEndLat('endLat')
      .arcEndLng('endLng')
      .arcColor('color')
      .arcAltitudeAutoScale(0.3)
      .arcStroke(0.5)
      .arcLabel('label');
  }, [conflictData, loaded]);

  const flightCount = flightsData?.flights?.length || 0;
  const gpsCount = gpsData?.events?.length || 0;
  const conflictCount = (conflictData?.events || []).filter(e => e.fatalities > 5).length;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-lg bg-slate-900">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Live Global Intelligence Map
          </span>
          {!loaded && !collapsed && (
            <span className="text-xs text-slate-400 animate-pulse">Loading…</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-4 mr-4">
            <LegendDot color="bg-red-500" label={`${flightCount} flights`} />
            <LegendDot color="bg-amber-500" label={`${gpsCount} GPS events`} />
            {conflictCount > 0 && <LegendDot color="bg-red-700" label={`${conflictCount} conflicts`} />}
          </div>
          <Button
            variant="ghost" size="sm"
            onClick={() => setCollapsed(c => !c)}
            className="text-slate-400 hover:text-white h-6 px-2"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span className="text-xs ml-1">{collapsed ? 'Expand' : 'Collapse'}</span>
          </Button>
        </div>
      </div>

      {/* Globe canvas */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 480 }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="relative overflow-hidden"
          >
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900" style={{ zIndex: 1 }}>
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
                  <p className="text-sm text-slate-400">Initializing Globe…</p>
                </div>
              </div>
            )}
            <div ref={containerRef} style={{ height: 480 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <span className="flex items-center gap-1 text-xs text-slate-400">
      <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
      {label}
    </span>
  );
}
