import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, Loader2, ExternalLink, Bug, AlertTriangle, Radio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCyberThreats } from '@/lib/intelligence/hooks';

const SEV_BADGE = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
};

const safeUrl = (url) => (url && /^https?:\/\//i.test(url) ? url : undefined);

export function CyberThreatsPanel() {
  const { data, isLoading, isError } = useCyberThreats();
  const [activeView, setActiveView] = useState('kev');

  if (isLoading) return <PanelLoader />;
  if (isError) return <PanelError />;

  const kev = data?.kev || [];
  const alerts = data?.alerts || [];
  const ransomwareCount = data?.ransomwareCount || 0;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Active Exploits" value={kev.length} icon={<Bug className="w-4 h-4 text-red-500" />} highlight={kev.length > 0} />
        <StatCard label="Ransomware-linked" value={ransomwareCount} icon={<AlertTriangle className="w-4 h-4 text-orange-500" />} highlight={ransomwareCount > 0} />
        <StatCard label="CISA Advisories" value={alerts.length} icon={<Radio className="w-4 h-4 text-sky-600" />} />
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveView('kev')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 flex items-center gap-1.5 ${
            activeView === 'kev'
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Bug className="w-3 h-3" /> Known Exploits ({kev.length})
        </button>
        <button
          onClick={() => setActiveView('alerts')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 flex items-center gap-1.5 ${
            activeView === 'alerts'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          <Radio className="w-3 h-3" /> CISA Advisories ({alerts.length})
        </button>
      </div>

      {/* KEV list */}
      {activeView === 'kev' && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {kev.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No KEV data available</p>
          ) : kev.map((v, i) => (
            <motion.div
              key={v.id || i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.4) }}
            >
              <Card className={`border transition-all ${v.ransomware ? 'border-red-200/70 bg-red-50/20' : 'glass-card border-slate-200/50'}`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <code className="text-xs font-mono text-red-600 font-semibold">{v.cve}</code>
                        {v.ransomware && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0 h-4 border">
                            Ransomware
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-700 leading-snug truncate">
                        {v.vendor} — {v.product}
                      </p>
                      {v.name && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{v.name}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {safeUrl(v.url) && (
                        <a href={safeUrl(v.url)} target="_blank" rel="noopener noreferrer"
                          className="text-slate-400 hover:text-sky-500 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {v.dateAdded && (
                        <span className="text-[10px] text-slate-400">{v.dateAdded}</span>
                      )}
                      {v.dueDate && (
                        <span className="text-[10px] text-orange-500">Due {v.dueDate}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Alerts list */}
      {activeView === 'alerts' && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">No advisory data available</p>
          ) : alerts.map((alert, i) => (
            <motion.div
              key={alert.id || i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.4) }}
            >
              <Card className="glass-card border-slate-200/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Badge className={`text-[10px] px-1.5 py-0 h-4 border ${SEV_BADGE[alert.severity] || SEV_BADGE.low}`}>
                          {alert.severity}
                        </Badge>
                        <span className="text-xs text-slate-400">{alert.source}</span>
                      </div>
                      {safeUrl(alert.link) ? (
                        <a href={safeUrl(alert.link)} target="_blank" rel="noopener noreferrer"
                          className="text-sm font-medium text-slate-800 hover:underline line-clamp-2 block">
                          {alert.title}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{alert.title}</p>
                      )}
                      {alert.snippet && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alert.snippet}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {safeUrl(alert.link) && (
                        <a href={safeUrl(alert.link)} target="_blank" rel="noopener noreferrer"
                          className="text-slate-400 hover:text-sky-500 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {alert.pubDate && (
                        <span className="text-[10px] text-slate-400">
                          {new Date(alert.pubDate).toLocaleDateString()}
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
        Sources: CISA Known Exploited Vulnerabilities Catalog · CISA Cybersecurity Advisories
      </p>
    </div>
  );
}

function StatCard({ label, value, icon, highlight }) {
  return (
    <Card className="glass-card border-slate-200/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
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
      <span className="text-sm">Loading cyber threat data…</span>
    </div>
  );
}

function PanelError() {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">Unable to load cyber threat data</span>
    </div>
  );
}
