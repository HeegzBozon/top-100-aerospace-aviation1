import React from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertCircle, Loader2, Activity, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMilitaryFlights } from '@/lib/intelligence/hooks';
import { brandColors } from '@/lib/intelligence/constants';

export function LiveFlightsPanel() {
  const { data, isLoading, isError } = useMilitaryFlights();
  const flights = data?.flights || [];
  const clusters = data?.clusters || [];

  if (isLoading) return <PanelLoader label="military flights" />;
  if (isError) return <PanelError message="Unable to load military flight data" />;

  const countries = new Set(flights.map(f => f.operatorCountry || f.country).filter(Boolean));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Tracked Flights" value={flights.length} icon={Plane} />
        <StatCard label="Operators" value={countries.size} icon={Globe} />
        <StatCard label="Clusters" value={clusters.length} icon={Activity} />
      </div>

      {flights.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">
          No military-pattern flights tracked at this time
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {flights.map((flight, i) => (
            <motion.div
              key={flight.icao24 || i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
            >
              <Card className="glass-card border-slate-200/50 transition-all duration-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base flex-shrink-0">{flight.operatorFlag || '✈️'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-slate-800">
                          {flight.callsign || flight.icao24 || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {flight.operator || flight.country || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-mono">
                        {flight.icao24?.toUpperCase()}
                      </Badge>
                      {flight.altitudeFt != null && flight.altitudeFt > 0 && (
                        <span className="text-xs text-slate-400 tabular-nums">
                          {flight.altitudeFt.toLocaleString()} ft
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      <p className="text-xs text-center text-slate-400">
        Source: OpenSky Network · ICAO hex enrichment · Live data
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
