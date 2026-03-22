import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Satellite, AlertCircle, Loader2, Globe2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSatellites } from '@/functions/getSatellites';

const TYPE_COLORS = {
  military: 'bg-red-100 text-red-700 border-red-200',
  station: 'bg-blue-100 text-blue-700 border-blue-200',
  weather: 'bg-purple-100 text-purple-700 border-purple-200',
  communication: 'bg-green-100 text-green-700 border-green-200',
};

export function SatelliteTracker() {
  const [satellites, setSatellites] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSatellites({})
      .then(res => {
        if (res.data?.error) throw new Error(res.data.error);
        setSatellites(res.data?.satellites || []);
      })
      .catch(err => setError(err.message || 'Unable to load satellite data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="satellites" />;
  if (error) return <PanelError message={error} />;

  const types = ['all', ...new Set(satellites.map(s => s.type).filter(Boolean))];
  const displayed = filter === 'all' ? satellites : satellites.filter(s => s.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-sky-600" />
          <span className="text-sm font-semibold text-slate-800">{satellites.length} satellites tracked</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter by type">
          {types.slice(0, 6).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              aria-pressed={filter === t}
              className={`text-xs px-2.5 py-1.5 rounded-full border transition-all duration-150 capitalize min-h-[36px] ${filter === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {displayed.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">No satellites in this category</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {displayed.slice(0, 100).map((sat, i) => (
            <motion.div key={sat.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}>
              <Card className="glass-card border-slate-200/50"><CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Satellite className="w-4 h-4 flex-shrink-0 text-sky-600" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-slate-800">{sat.name || sat.id}</p>
                      <p className="text-xs text-slate-500">{sat.country || '—'}{sat.alt ? ` · ${sat.alt} km` : ''}</p>
                    </div>
                  </div>
                  {sat.type && <Badge className={`text-xs capitalize flex-shrink-0 ${TYPE_COLORS[sat.type] || 'bg-slate-100 text-slate-600'}`}>{sat.type}</Badge>}
                </div>
              </CardContent></Card>
            </motion.div>
          ))}
        </div>
      )}
      {displayed.length > 100 && <p className="text-xs text-center text-slate-400">Showing 100 of {displayed.length} satellites</p>}
      <p className="text-xs text-center text-slate-400">Source: Celestrak · Updated daily</p>
    </div>
  );
}

function PanelLoader({ label }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}