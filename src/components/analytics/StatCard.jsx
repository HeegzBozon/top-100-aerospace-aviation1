import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ label, value, sub, trend }) {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      <span className="text-2xl font-bold text-white">{value ?? '—'}</span>
      <div className="flex items-center gap-1">
        {trend !== undefined && <TrendIcon className={`w-3 h-3 ${trendColor}`} />}
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
    </div>
  );
}