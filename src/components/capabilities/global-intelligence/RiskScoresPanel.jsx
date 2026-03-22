import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, TrendingDown, Minus, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getRiskScores } from '@/functions/getRiskScores';

const TREND_ICONS = {
  1: { icon: TrendingUp, color: 'text-red-500' },
  2: { icon: TrendingDown, color: 'text-green-500' },
  3: { icon: Minus, color: 'text-slate-400' },
};

function RiskBar({ score }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#22c55e';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{Math.round(score)}</span>
    </div>
  );
}

export function RiskScoresPanel() {
  const [ciiScores, setCiiScores] = useState([]);
  const [strategicRisks, setStrategicRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRiskScores({})
      .then(res => {
        if (res.data?.error) throw new Error(res.data.error);
        setCiiScores(res.data?.cii_scores || []);
        setStrategicRisks(res.data?.strategic_risks || []);
      })
      .catch(err => setError(err.message || 'Unable to load risk scores'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PanelLoader label="risk scores" />;
  if (error) return <PanelError message={error} />;
  if (!ciiScores.length && !strategicRisks.length) return <div className="text-center py-16 text-sm text-slate-400">No risk data available</div>;

  return (
    <div className="space-y-6">
      {ciiScores.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-sky-600" />
            <h3 className="font-semibold text-sm text-slate-800">Composite Instability Index</h3>
          </div>
          <div className="space-y-3">
            {ciiScores.map((score, i) => {
              const trendInfo = TREND_ICONS[score.trend] || TREND_ICONS[3];
              const TrendIcon = trendInfo.icon;
              return (
                <motion.div key={score.region || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="glass-card border-slate-200/50"><CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-slate-800">{score.region}</span>
                      <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} />
                    </div>
                    <RiskBar score={score.combined_score} />
                    {score.active_crises > 0 && (
                      <p className="text-xs text-slate-500 mt-1">{score.active_crises} active crisis{score.active_crises > 1 ? 'es' : ''}</p>
                    )}
                  </CardContent></Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {strategicRisks.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm text-slate-800 mb-3">Active Crises (ReliefWeb)</h3>
          <div className="space-y-2">
            {strategicRisks.map((risk, i) => (
              <Card key={i} className="glass-card border-slate-200/50"><CardContent className="p-3">
                <p className="text-sm font-semibold text-slate-800">{risk.region || 'Global'}</p>
                {risk.summary && <p className="text-xs text-slate-500 mt-1">{risk.summary}</p>}
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-center text-slate-400">Sources: ReliefWeb · Updated live</p>
    </div>
  );
}

function PanelLoader({ label }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-slate-500"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Loading {label}…</span></div>;
}
function PanelError({ message }) {
  return <div className="flex items-center justify-center py-16 gap-3 text-red-400"><AlertCircle className="w-5 h-5" /><span className="text-sm">{message}</span></div>;
}