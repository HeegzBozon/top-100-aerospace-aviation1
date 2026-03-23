import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, AlertCircle, Loader2, ExternalLink, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInfraThreats } from '@/lib/intelligence/hooks';

const SEV_BADGE = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high:     'bg-orange-100 text-orange-700 border-orange-200',
  medium:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  low:      'bg-slate-100 text-slate-600 border-slate-200',
};

const SECTOR_BADGE = {
  Energy:          'bg-amber-100 text-amber-700 border-amber-200',
  Water:           'bg-blue-100 text-blue-700 border-blue-200',
  Transportation:  'bg-violet-100 text-violet-700 border-violet-200',
  Manufacturing:   'bg-orange-100 text-orange-700 border-orange-200',
  Healthcare:      'bg-pink-100 text-pink-700 border-pink-200',
  Communications:  'bg-cyan-100 text-cyan-700 border-cyan-200',
  Industrial:      'bg-slate-100 text-slate-600 border-slate-200',
};

const safeUrl = (url) => (url && /^https?:\/\//i.test(url) ? url : undefined);

export function InfrastructurePanel() {
  const { data, isLoading, isError } = useInfraThreats();
  const [sectorFilter, setSectorFilter] = useState('all');

  if (isLoading) return <PanelLoader />;
  if (isError) return <PanelError />;

  const advisories = data?.advisories || [];
  const filtered = sectorFilter === 'all'
    ? advisories
    : advisories.filter(a => a.sector === sectorFilter);

  const criticalCount = advisories.filter(a => a.severity === 'critical').length;
  const sectors = [...new Set(advisories.map(a => a.sector))];

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="ICS Advisories" value={advisories.length} icon={<Shield className="w-4 h-4 text-sky-600" />} />
        <StatCard label="Critical" value={criticalCount} icon={<AlertCircle className="w-4 h-4 text-red-500" />} highlight={criticalCount > 0} />
        <StatCard label="Sectors Affected" value={sectors.length} icon={<Building2 className="w-4 h-4 text-slate-500" />} />
      </div>

      {/* Sector filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSectorFilter('all')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
            sectorFilter === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
          }`}
        >
          All ({advisories.length})
        </button>
        {sectors.map(s => (
          <button
            key={s}
            onClick={() => setSectorFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
              sectorFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {s} ({advisories.filter(a => a.sector === s).length})
          </button>
        ))}
      </div>

      {/* Advisory list */}
      {filtered.length === 0 ? (
        <p className="text-center text-sm text-slate-400 py-8">No advisories match current filter</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filtered.map((adv, i) => (
            <motion.div
              key={adv.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.4) }}
            >
              <Card className="glass-card border-slate-200/50">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <Badge className={`text-[10px] px-1.5 py-0 h-4 border ${SEV_BADGE[adv.severity] || SEV_BADGE.low}`}>
                          {adv.severity}
                        </Badge>
                        <Badge className={`text-[10px] px-1.5 py-0 h-4 border ${SECTOR_BADGE[adv.sector] || SECTOR_BADGE.Industrial}`}>
                          {adv.sector}
                        </Badge>
                        {adv.source && (
                          <span className="text-[10px] text-slate-400">{adv.source}</span>
                        )}
                      </div>
                      {safeUrl(adv.link) ? (
                        <a
                          href={safeUrl(adv.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-slate-800 hover:underline line-clamp-2 block"
                        >
                          {adv.title}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">{adv.title}</p>
                      )}
                      {adv.snippet && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{adv.snippet}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {safeUrl(adv.link) && (
                        <a
                          href={safeUrl(adv.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-sky-500 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {adv.pubDate && (
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(adv.pubDate).toLocaleDateString()}
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
        Source: CISA ICS-CERT Advisories · Updated hourly
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
      <span className="text-sm">Loading infrastructure advisories…</span>
    </div>
  );
}

function PanelError() {
  return (
    <div className="flex items-center justify-center py-16 gap-3 text-red-400">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">Unable to load infrastructure data</span>
    </div>
  );
}
