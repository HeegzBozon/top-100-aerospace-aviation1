import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plane, AlertCircle, Loader2, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const WM_BASE = 'https://worldmonitor-voip40t21-top-100-aerospace-and-aviation.vercel.app';
const brandColors = { navyDeep: '#1e3a5a', skyBlue: '#4a90b8' };

const AIRCRAFT_TYPE_LABELS = { 0:'Unknown',1:'Fighter',2:'Bomber',3:'Transport',4:'Tanker',5:'AWACS',6:'Recon',7:'Helicopter',8:'Drone',9:'Patrol',10:'Special Ops',11:'VIP',12:'Unknown' };
const OPERATOR_LABELS = { 0:'Unknown',1:'USAF',2:'USN',3:'USMC',4:'US Army',5:'RAF',6:'Royal Navy',7:'French AF',8:'Luftwaffe',9:'PLAAF',10:'PLAN',11:'VKS',12:'IAF',13:'NATO',14:'Other' };

export function LiveFlightsPanel() {
  const [flights, setFlights] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${WM_BASE}/api/military/v1/list-military-flights?page_size=50`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { setFlights(data.flights || []); setClusters(data.clusters || []); })
      .catch(err => { if (err.name !== 'AbortError') setError('Unable to load military flight data'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) return <PanelLoader label="military flights" />;
  if (error) return <PanelError message={error} />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Active Flights" value={flights.length} icon={Plane} />
        <StatCard label="Flight Clusters" value={clusters.length} icon={Activity} />
        <StatCard label="Flagged" value={flights.filter(f => f.is_interesting).length} icon={AlertCircle} highlight />
      </div>
      {flights.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">No military flights tracked at this time</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {flights.map((flight, i) => (
            <motion.div key={flight.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`border-slate-200/50 transition-all duration-200 ${flight.is_interesting ? 'border-amber-300/60 bg-amber-50/30' : 'glass-card'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Plane className="w-4 h-4 flex-shrink-0" style={{ color: brandColors.skyBlue }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: brandColors.navyDeep }}>{flight.callsign || flight.hex_code || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 truncate">{flight.aircraft_model || AIRCRAFT_TYPE_LABELS[flight.aircraft_type] || 'Unknown'} · {OPERATOR_LABELS[flight.operator] || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {flight.is_interesting && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">Flagged</Badge>}
                      {flight.altitude > 0 && <span className="text-xs text-slate-400">{Math.round(flight.altitude).toLocaleString()} ft</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, highlight }) {
  return (
    <Card className="glass-card border-slate-200/50"><CardContent className="p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${highlight ? 'text-amber-500' : ''}`} style={highlight ? {} : { color: '#4a90b8' }} />
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color: '#1e3a5a' }}>{value}</p>
    </CardContent></Card>
  );
}

function PanelLoader({ label }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}
