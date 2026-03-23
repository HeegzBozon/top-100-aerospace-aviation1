import { Users, Zap, Target } from 'lucide-react';

const MetricCard = ({ icon: Icon, title, value, description, color = "text-[var(--accent-2)]" }) => (
  <div className="bg-black/10 rounded-xl p-3 border border-white/5">
    <div className="flex items-center gap-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <div>
        <div className="font-bold text-lg">{value}</div>
        <div className="text-xs text-[var(--muted)] uppercase tracking-wide">{title}</div>
      </div>
    </div>
  </div>
);

export default function TrendsAndMeta({ nominees, activeSeason }) {
  const totalCompetitors = nominees ? nominees.length : 0;
  const averageAura = nominees && totalCompetitors > 0 
    ? Math.round(nominees.reduce((sum, n) => sum + (n.aura || 0), 0) / totalCompetitors)
    : 0;
  
  const topRiser = nominees && nominees.length > 0
    ? nominees
        .filter(n => n.delta24h > 0)
        .sort((a, b) => b.delta24h - a.delta24h)[0]
    : null;

  const mostEndorsed = nominees && nominees.length > 0
    ? nominees
        .sort((a, b) => (b.endorsements || 0) - (a.endorsements || 0))[0]
    : null;

  return (
    <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-4">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-[var(--text)]">
        <Zap className="w-5 h-5 text-[var(--accent)]" /> The Show
      </h2>
      {(!nominees || nominees.length === 0) ? (
        <div className="text-center py-4 text-[var(--muted)] text-sm">No meta data available.</div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <MetricCard 
            icon={Users}
            title="Competitors"
            value={totalCompetitors}
          />
          <MetricCard 
            icon={Target}
            title="Avg. Aura"
            value={averageAura}
          />
          {topRiser && (
            <div className="col-span-2 bg-green-500/10 rounded-xl p-3 border border-green-500/20">
              <h4 className="text-xs text-green-400 uppercase font-bold">Top Riser (24h)</h4>
              <div className="flex items-center gap-2 mt-1">
                <img 
                  src={topRiser.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${topRiser.nomineeId}`}
                  alt={topRiser.nomineeName}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-bold truncate text-[var(--text)]">{topRiser.nomineeName}</div>
                  <div className="text-sm font-bold text-green-400">+{topRiser.delta24h} Aura</div>
                </div>
              </div>
            </div>
          )}
          {mostEndorsed && (
            <div className="col-span-2 bg-purple-500/10 rounded-xl p-3 border border-purple-500/20">
              <h4 className="text-xs text-purple-400 uppercase font-bold">Most Endorsed</h4>
              <div className="flex items-center gap-2 mt-1">
                <img 
                  src={mostEndorsed.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${mostEndorsed.nomineeId}`}
                  alt={mostEndorsed.nomineeName}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <div className="font-bold truncate text-[var(--text)]">{mostEndorsed.nomineeName}</div>
                  <div className="text-sm font-bold text-purple-400">{mostEndorsed.endorsements} Endorsements</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}