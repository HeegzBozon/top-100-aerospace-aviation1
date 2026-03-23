import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertCircle, Loader2, Activity, Globe, Zap, AlertTriangle, MapPin, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMilitaryFlights, useWingbitsEnrichment, useConflictEvents } from '@/lib/intelligence/hooks';
import { AIRCRAFT_MODEL_PATTERNS, THEATER_LABELS } from '@/lib/intelligence/constants';
import { haversineKm } from '@/lib/intelligence/utils';

// ── File-level utilities ─────────────────────────────────────────────────────

function classifyRole(model) {
  if (!model) return null;
  for (const { pattern, role } of AIRCRAFT_MODEL_PATTERNS) {
    if (pattern.test(model)) return role;
  }
  return null;
}

const ROLE_COLORS = {
  Fighter:    'bg-red-100 text-red-700 border-red-200',
  Bomber:     'bg-purple-100 text-purple-700 border-purple-200',
  Transport:  'bg-blue-100 text-blue-700 border-blue-200',
  Tanker:     'bg-orange-100 text-orange-700 border-orange-200',
  AWACS:      'bg-cyan-100 text-cyan-700 border-cyan-200',
  Recon:      'bg-violet-100 text-violet-700 border-violet-200',
  Helicopter: 'bg-green-100 text-green-700 border-green-200',
  Drone:      'bg-slate-100 text-slate-600 border-slate-200',
};

const COUNTRY_MAP = {
  US:     ['US Military'],
  UK:     ['RAF', 'Royal Navy'],
  Russia: ['VKS'],
  China:  ['PLAAF', 'PLAN'],
  NATO:   ['NATO'],
};

// ── Component ────────────────────────────────────────────────────────────────

export function LiveFlightsPanel() {
  const { data, isLoading, isError } = useMilitaryFlights();
  const flights = data?.flights || [];

  const [filterCountry, setFilterCountry] = useState('all');
  const [filterTheater, setFilterTheater] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('conflict');
  const [newHexes, setNewHexes] = useState(new Set());
  const prevHexesRef = useRef(new Set());

  // Wingbits enrichment
  const icao24List = flights.map(f => f.icao24).filter(Boolean);
  const { enrichment, hasKey: hasWingbits } = useWingbitsEnrichment(icao24List);

  // Conflict events — degrades gracefully without ACLED key
  const { data: conflictData } = useConflictEvents();
  const conflictEvents = conflictData?.events || [];

  // Delta detection
  useEffect(() => {
    if (!flights.length) return;
    const current = new Set(flights.map(f => f.icao24));
    const added = [...current].filter(h => !prevHexesRef.current.has(h));
    if (added.length > 0) {
      setNewHexes(prev => new Set([...prev, ...added]));
      const timer = setTimeout(() => {
        setNewHexes(prev => {
          const next = new Set(prev);
          added.forEach(h => next.delete(h));
          return next;
        });
      }, 3000);
      prevHexesRef.current = current;
      return () => clearTimeout(timer);
    }
    prevHexesRef.current = current;
  }, [flights]);

  if (isLoading) return <PanelLoader label="military flights" />;
  if (isError) return <PanelError message="Unable to load military flight data" />;

  // Pre-enrich each flight with nearConflict so it's available for sorting
  const enrichedFlights = useMemo(() => flights.map(f => {
    if (!conflictEvents.length || !f.lat || !f.lon) return f;
    let minDist = Infinity;
    let nearest = null;
    for (const ev of conflictEvents) {
      const dist = haversineKm(f.lat, f.lon, ev.location.latitude, ev.location.longitude);
      if (dist < minDist) { minDist = dist; nearest = ev; }
    }
    return minDist <= 200 ? { ...f, _nearConflict: nearest } : f;
  }), [flights, conflictEvents]);

  // Filter
  const filtered = enrichedFlights.filter(f => {
    if (search) {
      const q = search.toLowerCase();
      const wb = enrichment[f.icao24?.toLowerCase()];
      if (![f.callsign, f.icao24, wb?.registration].some(v => v?.toLowerCase().includes(q))) return false;
    }
    if (filterCountry !== 'all') {
      const ops = COUNTRY_MAP[filterCountry] || [];
      if (!ops.some(op => (f.operator || '').includes(op))) return false;
    }
    if (filterTheater !== 'all' && f.theater !== filterTheater) return false;
    return true;
  });

  // Sort — conflict sort now works because nearConflict is precomputed
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'conflict') return (b._nearConflict ? 1 : 0) - (a._nearConflict ? 1 : 0);
    if (sortBy === 'altitude') return (b.altitudeFt || 0) - (a.altitudeFt || 0);
    if (sortBy === 'speed') return (b.velocity || 0) - (a.velocity || 0);
    if (sortBy === 'operator') return (a.operator || '').localeCompare(b.operator || '');
    return 0;
  });

  const countries = new Set(flights.map(f => f.operatorCountry || f.country).filter(Boolean));
  const activeTheaters = new Set(filtered.map(f => f.theater).filter(Boolean)).size;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Tracked Flights" value={filtered.length} icon={Plane} />
        <StatCard label="Operators" value={countries.size} icon={Globe} />
        <StatCard label="Active Theaters" value={activeTheaters} icon={MapPin} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-32">
          <Filter className="absolute left-2 top-2 w-3.5 h-3.5 text-slate-400" />
          <Input
            className="pl-7 h-8 text-xs bg-slate-50 border-slate-200"
            placeholder="Search callsign / hex…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger className="h-8 text-xs w-28">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="US">US</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
            <SelectItem value="Russia">Russia</SelectItem>
            <SelectItem value="China">China</SelectItem>
            <SelectItem value="NATO">NATO</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterTheater} onValueChange={setFilterTheater}>
          <SelectTrigger className="h-8 text-xs w-32">
            <SelectValue placeholder="Theater" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Theaters</SelectItem>
            {Object.entries(THEATER_LABELS).map(([k]) => (
              <SelectItem key={k} value={k}>{k}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-8 text-xs w-28">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="conflict">Conflict Risk</SelectItem>
            <SelectItem value="altitude">Altitude</SelectItem>
            <SelectItem value="speed">Speed</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flight list */}
      {sorted.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">
          {flights.length === 0
            ? 'No military-pattern flights tracked at this time'
            : 'No flights match current filters'}
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {sorted.map((flight, i) => {
            const wb = enrichment[flight.icao24?.toLowerCase()] || null;
            const displayName = wb?.registration || flight.callsign || flight.icao24 || 'Unknown';
            const model = wb?.model || wb?.typecode || null;
            const role = classifyRole(model);
            const operator = wb?.operator || flight.operator || flight.country || 'Unknown';
            const manufacturer = wb?.manufacturerName || null;

            // nearConflict precomputed in enrichedFlights — just read it
            const nearConflict = flight._nearConflict || null;

            return (
              <motion.div
                key={flight.icao24 || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <Card className="glass-card border-slate-200/50 transition-all duration-200">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base flex-shrink-0">{flight.operatorFlag || '✈️'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold truncate text-slate-800">
                              {displayName}
                            </p>
                            {wb && (
                              <Zap className="w-3 h-3 text-sky-400 flex-shrink-0" title="Wingbits enriched" />
                            )}
                            {newHexes.has(flight.icao24) && (
                              <Badge className="bg-green-500 text-white text-[10px] px-1 py-0 h-4 animate-pulse">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{operator}</p>
                          {model && (
                            <p className="text-xs text-sky-600 truncate font-medium">
                              {manufacturer ? `${manufacturer} ${model}` : model}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {flight.theater && (
                              <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-300 px-1 py-0 h-4">
                                {flight.theater}
                              </Badge>
                            )}
                            {role && (
                              <Badge className={`text-[10px] px-1 py-0 h-4 border ${ROLE_COLORS[role] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                {role}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          {nearConflict && (
                            <AlertTriangle
                              className="w-3.5 h-3.5 text-red-500"
                              title={`Near conflict: ${nearConflict.admin1 || nearConflict.location?.country || ''}`}
                            />
                          )}
                          <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-mono">
                            {flight.icao24?.toUpperCase()}
                          </Badge>
                        </div>
                        {flight.altitudeFt != null && flight.altitudeFt > 0 && (
                          <span className="text-xs text-slate-400 tabular-nums">
                            {flight.altitudeFt.toLocaleString()} ft
                          </span>
                        )}
                        {flight.velocity != null && flight.velocity > 0 && (
                          <span className="text-xs text-slate-400 tabular-nums">
                            {Math.round(flight.velocity)} kts
                          </span>
                        )}
                        {wb?.built && (
                          <span className="text-xs text-slate-400">
                            {new Date(wb.built).getFullYear()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-center text-slate-400">
        Source: OpenSky Network · ICAO hex enrichment{hasWingbits ? ' · Wingbits ⚡' : ''} · Live data
      </p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, highlight }) {
  return (
    <Card className="glass-card border-slate-200/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className={`w-4 h-4 ${highlight ? 'text-amber-500' : 'text-sky-600'}`} />
          <span className="text-xs text-slate-500 font-medium">{label}</span>
        </div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </CardContent>
    </Card>
  );
}

function PanelLoader({ label }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading {label}…</span>
    </div>
  );
}

function PanelError({ message }) {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
