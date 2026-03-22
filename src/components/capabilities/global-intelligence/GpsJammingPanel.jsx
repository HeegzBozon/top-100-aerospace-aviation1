import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getGpsJamming } from '@/functions/getGpsJamming';

export function GpsJammingPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getGpsJamming({})
      .then(res => {
        if (res.data?.error) throw new Error(res.data.error);
        setEvents(res.data?.events || []);
      })
      .catch(err => setError(err.message || 'Unable to load GPS interference data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="GPS interference data" />;
  if (error) return <PanelError message={error} />;

  if (!events.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Radio className="w-8 h-8 text-green-400" />
      <p className="text-sm font-medium text-green-600">No GPS interference detected</p>
      <p className="text-xs text-slate-400">All monitored regions nominal</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
        <p className="text-sm font-semibold text-amber-700">{events.length} GPS interference {events.length === 1 ? 'event' : 'events'} detected (last 3 days)</p>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {events.map((event, i) => (
          <motion.div key={event.id || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.5) }}>
            <Card className="border-amber-200/60 bg-amber-50/20"><CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Radio className="w-4 h-4 flex-shrink-0 text-amber-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-slate-800">{event.region || event.location_name || `Event ${i + 1}`}</p>
                    <p className="text-xs text-slate-500">{event.type} · {event.detected_at ? new Date(event.detected_at).toLocaleDateString() : 'Recent'}</p>
                  </div>
                </div>
                {event.severity && <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs flex-shrink-0 capitalize">{event.severity}</Badge>}
              </div>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-center text-slate-400">Source: GPSJam.org · Updated daily</p>
    </div>
  );
}

function PanelLoader({ label }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}