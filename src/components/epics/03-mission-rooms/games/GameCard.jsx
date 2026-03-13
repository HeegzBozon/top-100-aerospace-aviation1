import { Chess } from 'chess.js';
import { useMemo } from 'react';
import { Clock, Swords } from 'lucide-react';
import { createPageUrl } from '@/utils';

const STATUS_LABEL = {
  active: 'Active',
  checkmate: 'Checkmate',
  stalemate: 'Stalemate',
  draw: 'Draw',
  resigned: 'Resigned',
  timeout: 'Timeout',
  aborted: 'Aborted'
};

export default function GameCard({ game, currentUserEmail }) {
  const opponent = currentUserEmail === game.player_white_email
    ? { name: game.player_black_name, email: game.player_black_email, color: 'black' }
    : { name: game.player_white_name, email: game.player_white_email, color: 'white' };

  const myColor = currentUserEmail === game.player_white_email ? 'white' : 'black';

  const isMyTurn = useMemo(() => {
    if (game.status !== 'active') return false;
    const chess = new Chess();
    try { chess.load(game.current_fen); } catch { return false; }
    return (chess.turn() === 'w') === (myColor === 'white');
  }, [game.current_fen, myColor, game.status]);

  const isActive = game.status === 'active';

  return (
    <a
      href={createPageUrl(`ChessGame?id=${game.id}`)}
      className={`group flex items-center justify-between gap-4 px-4 py-3.5 border-b border-white/8 last:border-0 transition-colors hover:bg-white/[0.03] ${
        isMyTurn ? 'border-l-2 border-l-[var(--accent,#c9a84c)] pl-3' : ''
      }`}
      aria-label={`Game vs ${opponent.name}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Swords className={`w-4 h-4 shrink-0 ${isMyTurn ? 'text-[var(--accent,#c9a84c)]' : 'text-white/20'}`} />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate leading-tight">vs {opponent.name || opponent.email}</p>
          <p className="text-[11px] text-white/30 mt-0.5 uppercase tracking-wide">{myColor} · {game.time_control}</p>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 gap-1">
        <span className={`text-[10px] font-bold tracking-[0.1em] uppercase ${
          isActive
            ? isMyTurn ? 'text-[var(--accent,#c9a84c)]' : 'text-white/25'
            : 'text-white/20'
        }`}>
          {isActive ? (isMyTurn ? 'Your turn' : 'Waiting') : STATUS_LABEL[game.status]}
        </span>
        <span className="text-[10px] text-white/20 flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {game.move_count || 0}
        </span>
      </div>
    </a>
  );
}