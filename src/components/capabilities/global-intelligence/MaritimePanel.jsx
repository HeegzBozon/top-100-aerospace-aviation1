import { motion } from 'framer-motion';
import { Anchor, Ship, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MARITIME_CHOKEPOINTS, brandColors } from '@/lib/intelligence/constants';

const RISK_STYLES = {
  low:      { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700 border-green-200' },
  elevated: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  high:     { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700 border-red-200' },
};

export function MaritimePanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Anchor className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
        <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>Maritime Chokepoint Monitor</h3>
        <Badge variant="secondary" className="text-xs ml-auto">Static Data</Badge>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MARITIME_CHOKEPOINTS.map((cp, i) => {
          const style = RISK_STYLES[cp.risk] || RISK_STYLES.low;
          return (
            <motion.div key={cp.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={`${style.bg} ${style.border} border`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold" style={{ color: brandColors.navyDeep }}>{cp.name}</p>
                      <p className="text-xs text-slate-500">{cp.lat.toFixed(1)}°, {cp.lon.toFixed(1)}°</p>
                    </div>
                    <Badge className={`${style.badge} text-xs capitalize`}>{cp.risk}</Badge>
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
  );
}
