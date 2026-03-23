import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronUp, ChevronDown, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMilitaryFlights } from '@/lib/intelligence/hooks';
import { useGpsJamming } from '@/lib/intelligence/hooks';

export function WorldMonitorGlobe() {
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const globeRef = useRef(null);
  const containerRef = useRef(null);
  const { data: flightsData } = useMilitaryFlights();
  const { data: gpsData } = useGpsJamming();

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
      if (globe && globe._destructor) globe._destructor();
    };
  }, [collapsed]);

  useEffect(() => {
    if (!globeRef.current || !loaded) return;
    const globe = globeRef.current;

    const flights = (flightsData?.flights || []).map(f => ({
      lat: f.lat,
      lng: f.lon,
      size: 0.3,
      color: '#ef4444',
      label: f.callsign || f.icao24,
    }));

    const gpsEvents = (gpsData?.events || []).map(e => ({
      lat: e.lat,
      lng: e.lon,
      size: e.severity === 'high' ? 0.8 : e.severity === 'medium' ? 0.5 : 0.3,
      color: e.severity === 'high' ? '#f59e0b' : e.severity === 'medium' ? '#eab308' : '#a3e635',
      label: e.region,
    }));

    const allPoints = [...flights, ...gpsEvents];
    globe
      .pointsData(allPoints)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude(() => 0.01)
      .pointRadius('size')
      .pointColor('color')
      .pointLabel('label');
  }, [flightsData, gpsData, loaded]);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200/50 shadow-lg bg-slate-900">
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
          <div className="flex items-center gap-3 mr-4">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Flights
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> GPS Jamming
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(c => !c)} className="text-slate-400 hover:text-white h-6 px-2">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <span className="text-xs ml-1">{collapsed ? 'Expand' : 'Collapse'}</span>
          </Button>
        </div>
      </div>
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
