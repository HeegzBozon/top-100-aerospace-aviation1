import { Trophy } from 'lucide-react';

const RANK_COLORS = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];

export default function LeaderboardTable({ profiles }) {
  const sorted = [...(profiles || [])].sort((a, b) => (b.elo_rating || 1200) - (a.elo_rating || 1200));

  if (!sorted.length) return (
    <p className="text-white/25 text-sm text-center py-12">No players yet.</p>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" role="table" aria-label="Club leaderboard">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left pb-3 pr-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25 w-10">#</th>
            <th className="text-left pb-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25">Player</th>
            <th className="text-right pb-3 px-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25">Rating</th>
            <th className="text-right pb-3 px-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25 hidden sm:table-cell">W</th>
            <th className="text-right pb-3 px-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25 hidden sm:table-cell">L</th>
            <th className="text-right pb-3 px-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25 hidden sm:table-cell">D</th>
            <th className="text-right pb-3 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/25 hidden sm:table-cell">G</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => (
            <tr key={p.id} className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors last:border-0">
              <td className="py-3.5 pr-3">
                {i < 3 ? (
                  <Trophy className={`w-3.5 h-3.5 ${RANK_COLORS[i]}`} />
                ) : (
                  <span className="text-white/20 text-xs">{i + 1}</span>
                )}
              </td>
              <td className="py-3.5">
                <div className="flex items-center gap-2.5">
                  {p.avatar_url
                    ? <img src={p.avatar_url} alt={p.display_name} className="w-6 h-6 rounded-full object-cover" />
                    : <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">{(p.display_name || p.user_email || '?')[0].toUpperCase()}</div>
                  }
                  <span className="font-medium text-sm truncate max-w-[140px]">{p.display_name || p.user_email}</span>
                </div>
              </td>
              <td className="py-3.5 px-3 text-right">
                <span className="font-bold text-[var(--accent,#c9a84c)] tabular-nums">{p.elo_rating || 1200}</span>
              </td>
              <td className="py-3.5 px-3 text-right text-white/40 tabular-nums hidden sm:table-cell text-xs">{p.wins || 0}</td>
              <td className="py-3.5 px-3 text-right text-white/40 tabular-nums hidden sm:table-cell text-xs">{p.losses || 0}</td>
              <td className="py-3.5 px-3 text-right text-white/40 tabular-nums hidden sm:table-cell text-xs">{p.draws || 0}</td>
              <td className="py-3.5 text-right text-white/25 tabular-nums hidden sm:table-cell text-xs">{p.games_played || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}