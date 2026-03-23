import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, AlertCircle, ExternalLink, Activity, Flame, Waves } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNaturalDisasters } from '@/lib/intelligence/hooks';

const TYPE_CONFIG = {
  earthquake: { icon: '🌍', label: 'Earthquake', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  flood:      { icon: '🌊', label: 'Flood',      color: 'bg-blue-100 text-blue-700 border-blue-200' },
  cyclone:    { icon: '🌀', label: 'Cyclone',    color: 'bg-violet-100 text-violet-700 border-violet-200' },
  volcano:    { icon: '🌋', label: 'Volcano',    color: 'bg-red-100 text-red-700 border-red-200' },
  tsunami:    { icon: '🌊', label: 'Tsunami',    color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  drought:    { icon: '☀️', label: 'Drought',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  disaster:   { icon: '⚠️', label: 'Disaster',   color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const SEV_COLORS = {
  critical: 'border-red-200/70 bg-red-50/30',
  high:     'border-orange-200/60 bg-orange-50/20',
  medium:   'border-yellow-200/50 bg-yellow-50/10',
  low:      'glass-card',
};

const SEV_BADGE = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
};

const safeUrl = (url) => (url && /^https?:\/\//i.test(url) ? url : undefined);

export function DisastersPanel() {
  const { data, isLoading, isError } = useNaturalDisasters();
  const [filter, setFilter] = useState('all');

  if (isLoading) return <PanelLoader />;
  if (isError) return <PanelError />;

  const events = data?.events || [];
  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  const typeCount = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const highCount = events.filter(e => e.severity === 'high').length;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Events" value={events.length} icon="🌐" />
        <StatCard label="Critical" value={criticalCount} icon="🔴" highlight />
        <StatCard label="Earthquakes" value={typeCount.earthquake || 0} icon="🌍" />
        <StatCard label="Other Hazards" value={events.length - (typeCount.earthquake || 0)} icon="⚠️" />
      </div>

      {/* Type filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'earthquake', 'cyclone', 'flood', 'volcano', 'tsunami'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all duration-150 ${
              filter === t
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {t === 'all' ? `All (${events.length})` : `${TYPE_CONFIG[t]?.icon} ${t} (${typeCount[t] || 0})`}
          </button>
        ))}
      </div>

      {/* Event list */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">No events match current filter</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.map((ev, i) => {
            const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.disaster;
            return (
              <motion.div
                key={ev.id || i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.4) }}
              >
                <Card className={`border transition-all ${SEV_COLORS[ev.severity] || 'glass-card'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-lg leading-none mt-0.5 flex-shrink-0">{cfg.icon}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <Badge className={`text-[10px] px-1.5 py-0 h-4 border ${cfg.color}`}>
                              {cfg.label}
                            </Badge>
                            <Badge className={`text-[10px] px-1.5 py-0 h-4 border ${SEV_BADGE[ev.severity]}`}>
                              {ev.severity}
                            </Badge>
                            {ev.magnitude != null && (
                              <span className="text-xs font-bold text-slate-700">M{ev.magnitude.toFixed(1)}</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">
                            {ev.title}
                          </p>
                          {ev.place && ev.type === 'earthquake' && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">{ev.place}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {safeUrl(ev.url) && (
                          <a href={safeUrl(ev.url)} target="_blank" rel="noopener noreferrer"
                            className="text-slate-400 hover:text-sky-500 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {ev.occurredAt && (
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {new Date(ev.occurredAt).toLocaleDateString()}
                          </span>
                        )}
                        {ev.depth != null && (
                          <span className="text-[10px] text-slate-400">{Math.round(ev.depth)} km depth</span>
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
        Sources: USGS Earthquake Hazards Program · GDACS Global Disaster Alert · Updated every 15 min
      </p>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <Card className="glass-card border-slate-200/50">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-sm">{icon}</span>
          <span className="text-xs text-slate-500 font-medium">{label}</span>
        </div>
        <p className={`text-2xl font-bold ${highlight && value > 0 ? 'text-red-600' : 'text-slate-800'}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function PanelLoader() {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Loading disaster alerts…</span>
    </div>
  );
}

function PanelError() {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">Unable to load disaster data</span>
    </div>
  );
}
