import React from 'react';
import { Users, Zap, Trophy, TrendingUp, Clock } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, trend, color = "text-[var(--text)]" }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card)]/60 backdrop-blur-sm rounded-xl border border-[var(--border)]/50">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-2)]/20 flex items-center justify-center`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-[var(--muted)] flex items-center gap-1">
        {label}
        {trend && (
          <span className={`flex items-center gap-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className="w-3 h-3" />
            {Math.abs(trend)}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default function QuickStatsBar({ 
  totalCompetitors = 0,
  liveVotesToday = 0,
  topAura = 0,
  avgAura = 0,
  activeSeason,
  lastUpdateTime
}) {
  const formatTime = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-[var(--card)]/40 backdrop-blur-sm border-y border-[var(--border)]/50 py-4">
      <div className="max-w-8xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <StatCard 
            icon={Users}
            label="Active Competitors"
            value={totalCompetitors}
            color="text-[var(--accent)]"
          />
          <StatCard 
            icon={Zap}
            label="Votes Today"
            value={liveVotesToday}
            color="text-[var(--accent-2)]"
          />
          <StatCard 
            icon={Trophy}
            label="Top Aura"
            value={Math.round(topAura)}
            color="text-yellow-500"
          />
          <StatCard 
            icon={TrendingUp}
            label="Average Aura"
            value={Math.round(avgAura)}
            color="text-blue-500"
          />
          <StatCard 
            icon={Clock}
            label="Last Update"
            value={formatTime(lastUpdateTime)}
            color="text-[var(--muted)]"
          />
        </div>
      </div>
    </div>
  );
}