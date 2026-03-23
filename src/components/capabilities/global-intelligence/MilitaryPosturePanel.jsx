import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Plane, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheaterPosture } from '@/lib/intelligence/hooks';
import { POSTURE_COLORS, THEATER_LABELS, brandColors } from '@/lib/intelligence/constants';

export function MilitaryPosturePanel() {
  const { data, isLoading, isError } = useTheaterPosture();
  const theaters = data?.theaters || [];

  if (isLoading) return <PanelLoader label="theater posture" />;
  if (isError) return <PanelError message="Unable to load theater posture data" />;
  if (!theaters.length) return <div className="text-center py-16 text-sm text-slate-400">No posture data available</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-5 h-5" style={{ color: brandColors.skyBlue }} />
        <h3 className="font-semibold text-sm" style={{ color: brandColors.navyDeep }}>Combatant Command Posture</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {theaters.map((t, i) => {
          const colors = POSTURE_COLORS[t.postureLevel] || POSTURE_COLORS.unknown;
          return (
            <motion.div key={t.theater} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card className={`border ${colors.border} ${colors.bg}/30`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold" style={{ color: brandColors.navyDeep }}>{t.theater}</p>
                      <p className="text-xs text-slate-500">{THEATER_LABELS[t.theater] || t.theater}</p>
                    </div>
                    <Badge className={`${colors.bg} ${colors.text} ${colors.border} text-xs capitalize`}>
                      {t.postureLevel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-600">{t.activeFlights} mil. flights</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: colors.dot }} />
                      <span className="text-xs text-slate-500">{new Date(t.assessedAt).toLocaleTimeString()}</span>
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

function PanelLoader({ label }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}
