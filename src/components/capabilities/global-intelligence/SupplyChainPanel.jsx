import { motion } from 'framer-motion';
import { PackageSearch, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSupplyChainIntel } from '@/lib/intelligence/hooks';
import { brandColors } from '@/lib/intelligence/constants';

// ── Simple SVG sparkline ──────────────────────────────────────────────────
function Sparkline({ data, width = 120, height = 36 }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.value).filter(v => v != null);
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const trend = values[values.length - 1] >= values[0];
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={trend ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

const CANAL_BADGE = {
  Suez:   'bg-orange-100 text-orange-700 border border-orange-200',
  Panama: 'bg-blue-100 text-blue-700 border border-blue-200',
  Other:  'bg-slate-100 text-slate-500 border border-slate-200',
};

const STATUS_DOT = {
  red:    'bg-red-500',
  yellow: 'bg-yellow-400',
  green:  'bg-green-500',
};

const STATUS_LABEL = {
  red:    'High Risk',
  yellow: 'Elevated',
  green:  'Normal',
};

export function SupplyChainPanel() {
  const { disruptions, isLoadingDisruptions, bdiData, isLoadingBDI, chokepoints } = useSupplyChainIntel();

  const latestBDI = bdiData[0]?.value;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <PackageSearch className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
        <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>
          Supply Chain Intelligence
        </h3>
      </div>

      {/* Chokepoint Status Grid */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
          Key Route Status
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {chokepoints.map(cp => (
            <motion.div
              key={cp.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card border-slate-200/50">
                <CardContent className="p-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[cp.statusColor]}`} />
                    <span className="text-xs font-medium text-slate-700 leading-tight">{cp.name}</span>
                  </div>
                  <span className={`text-xs ${cp.statusColor === 'red' ? 'text-red-600' : cp.statusColor === 'yellow' ? 'text-yellow-600' : 'text-green-600'}`}>
                    {STATUS_LABEL[cp.statusColor]}
                  </span>
                  <span className="text-xs text-slate-400">{cp.dailyShips} ships/day</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BDI Trend */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
          Baltic Dry Index — 30-Day Trend
        </p>
        {isLoadingBDI ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading BDI data…
          </div>
        ) : bdiData.length === 0 ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-5 text-sm text-slate-400 text-center">
            BDI data unavailable — connect{' '}
            <a
              href="https://data.nasdaq.com/data/CHRIS/CME_BF1"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-slate-600"
            >
              Nasdaq Data Link
            </a>{' '}
            to enable
          </div>
        ) : (
          <Card className="glass-card border-slate-200/50">
            <CardContent className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-bold" style={{ color: brandColors.navyDeep }}>
                  {latestBDI?.toLocaleString() ?? '—'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest settle · {bdiData[0]?.date ?? ''}
                </p>
              </div>
              <Sparkline data={[...bdiData].reverse()} />
            </CardContent>
          </Card>
        )}
      </section>

      {/* Canal Disruption Alerts */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
          Canal & Freight Disruption Alerts
        </p>
        {isLoadingDisruptions ? (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Scanning maritime feeds…
          </div>
        ) : disruptions.length === 0 ? (
          <div className="text-center py-10 text-sm text-slate-400">
            No disruption alerts detected
          </div>
        ) : (
          <div className="space-y-2">
            {disruptions.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="glass-card border-slate-200/50">
                  <CardContent className="p-3 flex items-start gap-3">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 mt-0.5 ${CANAL_BADGE[item.canal]}`}>
                      {item.canal}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-slate-700 hover:text-slate-900 line-clamp-2 flex items-start gap-1 group"
                      >
                        {item.title}
                        <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                      </a>
                      {item.snippet && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{item.snippet}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">{item.source}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
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
