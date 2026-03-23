import { motion } from 'framer-motion';
import { Anchor, Ship, AlertTriangle, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MARITIME_CHOKEPOINTS, brandColors } from '@/lib/intelligence/constants';
import { useMaritimeIntel } from '@/lib/intelligence/hooks';

const RISK_STYLES = {
  low:      { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700 border-green-200' },
  elevated: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  high:     { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700 border-red-200' },
};

const INCIDENT_TYPE_CONFIG = {
  piracy:     { icon: '🏴‍☠️', label: 'Piracy',     color: 'bg-red-100 text-red-700 border-red-200' },
  conflict:   { icon: '💥', label: 'Conflict',   color: 'bg-orange-100 text-orange-700 border-orange-200' },
  accident:   { icon: '⚠️', label: 'Accident',   color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  disruption: { icon: '🚧', label: 'Disruption', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  sanctions:  { icon: '🛑', label: 'Sanctions',  color: 'bg-slate-100 text-slate-600 border-slate-200' },
  news:       { icon: '📰', label: 'News',       color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

const safeUrl = (url) => (url && /^https?:\/\//i.test(url) ? url : undefined);

export function MaritimePanel() {
  const { data, isLoading, isError } = useMaritimeIntel();
  const incidents = data?.incidents || [];

  return (
    <div className="space-y-6">
      {/* ── Chokepoint Grid ─────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Anchor className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
          <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>
            Maritime Chokepoint Monitor
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {MARITIME_CHOKEPOINTS.map((cp, i) => {
            const style = RISK_STYLES[cp.risk] || RISK_STYLES.low;
            return (
              <motion.div
                key={cp.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`${style.bg} ${style.border} border`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold" style={{ color: brandColors.navyDeep }}>
                          {cp.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {cp.lat.toFixed(1)}°, {cp.lon.toFixed(1)}°
                        </p>
                      </div>
                      <Badge className={`${style.badge} text-xs capitalize border`}>{cp.risk}</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-600">~{cp.dailyShips} ships/day</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {cp.risk === 'high' && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                        <span className="text-xs text-slate-500 capitalize">{cp.traffic} traffic</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Live Incident Feed ──────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Ship className="w-4 h-4 text-slate-500" />
          <h3 className="font-semibold text-sm text-slate-700">Live Maritime Incidents</h3>
          {incidents.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-auto">{incidents.length} items</Badge>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 gap-3 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading maritime feed…</span>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-10 gap-3 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Unable to load maritime incidents</span>
          </div>
        ) : incidents.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No incident data available</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {incidents.map((inc, i) => {
              const cfg = INCIDENT_TYPE_CONFIG[inc.type] || INCIDENT_TYPE_CONFIG.news;
              return (
                <motion.div
                  key={inc.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                >
                  <Card className="glass-card border-slate-200/50">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="text-sm leading-none">{cfg.icon}</span>
                            <Badge className={`text-[10px] px-1.5 py-0 h-4 border ${cfg.color}`}>
                              {cfg.label}
                            </Badge>
                            {inc.source && (
                              <span className="text-[10px] text-slate-400">{inc.source}</span>
                            )}
                          </div>
                          {safeUrl(inc.link) ? (
                            <a
                              href={safeUrl(inc.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-slate-800 hover:underline line-clamp-2 block"
                            >
                              {inc.title}
                            </a>
                          ) : (
                            <p className="text-sm font-medium text-slate-800 line-clamp-2">{inc.title}</p>
                          )}
                          {inc.snippet && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{inc.snippet}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {safeUrl(inc.link) && (
                            <a
                              href={safeUrl(inc.link)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-sky-500 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {inc.pubDate && (
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(inc.pubDate).toLocaleDateString()}
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
      </div>

      <p className="text-xs text-center text-slate-400">
        Chokepoints: static risk data · Incidents: Maritime Bulletin · gCaptain · Hellenic Shipping News
      </p>
    </div>
  );
}
