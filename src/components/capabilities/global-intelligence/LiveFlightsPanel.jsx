import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertCircle, Loader2, Activity, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMilitaryFlights } from '@/functions/getMilitaryFlights';

export function LiveFlightsPanel() {
  const [flights, setFlights] = useState([]);
  const [totalTracked, setTotalTracked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMilitaryFlights({})
      .then(res => {
        if (res.data?.error) throw new Error(res.data.error);
        setFlights(res.data?.flights || []);
        setTotalTracked(res.data?.total_tracked || 0);
      })
      .catch(err => setError(err.message || 'Unable to load flight data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="military flights" />;
  if (error) return <PanelError message={error} />;

  const flagged = flights.filter(f => f.is_interesting);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Tracked Flights" value={flights.length} icon={Plane} />
        <StatCard label="Total Live" value={totalTracked.toLocaleString()} icon={Globe} />
        <StatCard label="Flagged Squawks" value={flagged.length} icon={AlertCircle} highlight={flagged.length > 0} />
      </div>

      {flights.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">No military-pattern flights tracked at this time</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {flights.map((flight, i) => (
            <motion.div key={flight.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}>
              <Card className={`border-slate-200/50 transition-all duration-200 ${flight.is_interesting ? 'border-amber-300/60 bg-amber-50/30' : 'glass-card'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Plane className="w-4 h-4 flex-shrink-0 text-sky-600" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate text-slate-800">{flight.callsign || flight.id || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 truncate">{flight.operator || 'Unknown'} · {flight.squawk ? `Squawk ${flight.squawk}` : 'No squawk'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {flight.is_interesting && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">7{flight.squawk?.slice(1)}</Badge>}
                      {flight.altitude > 0 && <span className="text-xs text-slate-400">{flight.altitude.toLocaleString()} ft</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      <p className="text-xs text-center text-slate-400">Source: OpenSky Network · Live data</p>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, highlight }) {
  return (
    <Card className="glass-card border-slate-200/50"><CardContent className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${highlight ? 'text-amber-500' : 'text-sky-600'}`} />
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </CardContent></Card>
  );
}

function PanelLoader({ label }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}