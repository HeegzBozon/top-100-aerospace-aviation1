import { useState, useEffect, useCallback, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { chessSubmitMove } from '@/functions/chessSubmitMove';
import { chessBotMove } from '@/functions/chessBotMove';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Flag, Bot, Crown, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Chess } from 'chess.js';
import ChessBoard from '@/components/chess/ChessBoard';
import MoveHistory from '@/components/chess/MoveHistory';
import GameChatPanel from '@/components/chess/GameChatPanel';
import { ThemeContext } from '@/components/core/ThemeContext';
import { toast } from 'sonner';

function PlayerRow({ name, email, color, isActive, isBot, isSelf }) {
  const initial = (name || email || '?')[0]?.toUpperCase();
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/[0.03] border border-white/5'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          isSelf
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black'
            : 'bg-white/10 text-white/70'
        }`}>
          {isBot ? <Bot className="w-4 h-4" /> : initial}
        </div>
        <div>
          <p className="font-semibold text-sm text-white leading-tight">{name || email}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">{color}</p>
        </div>
      </div>
      {isActive && (
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-amber-400 animate-pulse">
          {isSelf ? 'Your Turn' : 'Thinking…'}
        </span>
      )}
    </div>
  );
}

export default function ChessGame() {
  const urlParams = new URLSearchParams(window.location.search);
  const gameId = urlParams.get('id');
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [boardTheme, setBoardTheme] = useState('classic');
  const [pieceSet, setPieceSet] = useState('cburnett');
  const qc = useQueryClient();
  const { mode, setMode } = useContext(ThemeContext) || { mode: 'dark', setMode: () => {} };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: game, isLoading } = useQuery({
    queryKey: ['chess-game', gameId],
    queryFn: () => base44.entities.ChessGame.get(gameId),
    enabled: !!gameId && !!user,
    refetchInterval: (query) => query.state.data?.status === 'active' ? 5000 : false
  });

  useEffect(() => {
    if (!gameId) return;
    const unsub = base44.entities.ChessGame.subscribe(event => {
      if (event.id === gameId) qc.invalidateQueries({ queryKey: ['chess-game', gameId] });
    });
    return unsub;
  }, [gameId, qc]);

  const myColor = game?.player_white_email === user?.email ? 'white' : 'black';
  const isDark = mode === 'dark';
  
  const isMyTurn = (() => {
    if (!game || game.status !== 'active') return false;
    try {
      const chess = new Chess(game.current_fen);
      return (chess.turn() === 'w') === (myColor === 'white');
    } catch { return false; }
  })();

  const handleMove = useCallback(async (move) => {
    if (submitting || !isMyTurn) return;
    setSubmitting(true);
    const res = await chessSubmitMove({ game_id: gameId, move });
    if (res?.data?.error) {
      toast.error(res.data.error);
    } else {
      qc.invalidateQueries({ queryKey: ['chess-game', gameId] });
      if (res?.data?.game?.status !== 'active') {
        const won = res.data.game.winner_email === user?.email;
        toast.success(won ? '🏆 You win!' : `Game over: ${res.data.game.status}`);
      }
    }
    setSubmitting(false);
    if (!res?.data?.error && game?.is_bot_game && res?.data?.game?.status === 'active') {
      setTimeout(async () => {
        await chessBotMove({ game_id: gameId });
        qc.invalidateQueries({ queryKey: ['chess-game', gameId] });
      }, 600);
    }
  }, [gameId, isMyTurn, submitting, qc, game, user]);

  const handleResign = useCallback(async () => {
    if (!game || game.status !== 'active') return;
    await base44.entities.ChessGame.update(gameId, {
      status: 'resigned',
      winner_email: myColor === 'white' ? game.player_black_email : game.player_white_email
    });
    qc.invalidateQueries({ queryKey: ['chess-game', gameId] });
    toast.info('You resigned.');
  }, [game, gameId, myColor, qc]);

  if (!gameId) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white/30 text-sm">
      No game ID provided.
    </div>
  );

  if (isLoading || !game || !user) return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-white/30 text-xs tracking-widest uppercase">Loading game…</p>
      </div>
    </div>
  );

  const opponent = myColor === 'white'
    ? { name: game.player_black_name, email: game.player_black_email }
    : { name: game.player_white_name, email: game.player_white_email };

  const opponentColor = myColor === 'white' ? 'black' : 'white';
  const isOpponentBot = game.is_bot_game && (opponent.email || '').includes('@chessclub.internal');

  const isGameOver = game.status !== 'active';
  const playerWon = game.winner_email === user?.email;

  const statusLabel = {
    checkmate: playerWon ? 'Checkmate — You Win!' : 'Checkmate — You Lose',
    stalemate: 'Stalemate — Draw',
    draw: 'Draw',
    resigned: playerWon ? 'Opponent Resigned — You Win!' : 'You Resigned',
    timeout: 'Timeout',
    aborted: 'Game Aborted'
  }[game.status] || game.status;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0f1f35] to-[#0a1628]">
      {/* Top bar */}
      <div className="border-b border-white/5 bg-white/[0.01] backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a
            href={createPageUrl('ChessClub')}
            className="flex items-center gap-2.5 text-sm font-medium text-white/60 hover:text-white transition-colors group"
            aria-label="Back to Chess Club"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Chess Club</span>
          </a>
          
          <div className="flex items-center gap-3">
            {game.is_bot_game && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4a574]/10 border border-[#d4a574]/30 text-[#d4a574] text-xs font-semibold">
                <Bot className="w-3.5 h-3.5" />
                <span>vs {game.bot_difficulty?.charAt(0).toUpperCase() + game.bot_difficulty?.slice(1) || 'Bot'}</span>
              </div>
            )}
            <div className="text-white/40 text-xs font-mono uppercase tracking-widest">{game.time_control}</div>
            <select
              value={boardTheme}
              onChange={(e) => setBoardTheme(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-medium uppercase tracking-widest cursor-pointer transition-colors"
              aria-label="Choose board theme"
            >
              <option value="classic">Classic</option>
              <option value="top100">TOP 100</option>
              <option value="deepSpace">Deep Space</option>
              <option value="lichess">Lichess</option>
            </select>
            {boardTheme === 'lichess' && (
              <select
                value={pieceSet}
                onChange={(e) => setPieceSet(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-medium uppercase tracking-widest cursor-pointer transition-colors"
                aria-label="Choose piece set"
              >
                <option value="cburnett">Cburnett</option>
                <option value="staunty">Staunty</option>
                <option value="merida">Merida</option>
                <option value="spatial">Spatial</option>
                <option value="governors">Governors</option>
                <option value="fresca">Fresca</option>
                <option value="cardinal">Cardinal</option>
                <option value="mono">Mono</option>
                <option value="alpha">Alpha</option>
                <option value="california">California</option>
              </select>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMode(isDark ? 'light' : 'dark')}
              className="w-9 h-9 text-white/40 hover:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          {/* Main board area */}
          <div className="space-y-6">
            {/* Opponent info */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8b7355] flex items-center justify-center text-sm font-bold text-white/80">
                  {isOpponentBot ? <Bot className="w-5 h-5" /> : (opponent.name || opponent.email || '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{opponent.name || opponent.email}</p>
                  <p className="text-xs text-white/40 uppercase tracking-wide">{opponentColor}</p>
                </div>
              </div>
              {!isMyTurn && game.status === 'active' && (
                <span className="text-xs font-bold text-[#d4a574] animate-pulse">Thinking…</span>
              )}
            </div>

            {/* Chess board */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 transition-all duration-500" 
              style={{
                ringColor: isMyTurn && game.status === 'active' ? 'rgba(212, 165, 116, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                boxShadow: isMyTurn && game.status === 'active' ? '0 0 30px rgba(212, 165, 116, 0.2)' : '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}>
              {submitting && (
                <div className="absolute inset-0 z-20 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                  <div className="w-8 h-8 border-2 border-[#d4a574]/40 border-t-[#d4a574] rounded-full animate-spin" />
                </div>
              )}
              <ChessBoard
                fen={game.current_fen}
                playerColor={myColor}
                onMove={handleMove}
                disabled={!isMyTurn || game.status !== 'active' || submitting}
                boardTheme={boardTheme}
                pieceSet={pieceSet}
              />
            </div>

            {/* Current player info */}
            <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4a574] to-[#8b7355] flex items-center justify-center text-sm font-bold text-white/90">
                  {(user?.full_name || user?.email || '?')[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{user?.full_name || user?.email}</p>
                  <p className="text-xs text-white/40 uppercase tracking-wide">{myColor}</p>
                </div>
              </div>
              {isMyTurn && game.status === 'active' && (
                <span className="text-xs font-bold text-[#d4a574] animate-pulse">Your Turn</span>
              )}
            </div>

            {/* Game over state */}
            {isGameOver && (
              <div className={`rounded-xl p-6 text-center border ${
                playerWon
                  ? 'bg-[#d4a574]/10 border-[#d4a574]/30'
                  : 'bg-white/5 border-white/10'
              }`}>
                {playerWon && <Crown className="w-8 h-8 text-[#d4a574] mx-auto mb-3" />}
                <p className={`font-bold text-lg tracking-tight ${playerWon ? 'text-[#d4a574]' : 'text-white/80'}`}>
                  {statusLabel}
                </p>
              </div>
            )}

            {/* Resign button */}
            {game.status === 'active' && (
              <Button
                variant="outline"
                onClick={handleResign}
                className="w-full h-11 border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 text-xs font-semibold tracking-widest uppercase"
              >
                <Flag className="w-3.5 h-3.5 mr-2" /> Resign
              </Button>
            )}
          </div>

          {/* Side panel */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur">
              <Tabs defaultValue="moves" className="w-full">
                <TabsList className="w-full bg-transparent p-0 h-auto rounded-none border-b border-white/10">
                  {['moves', 'chat'].map(v => (
                    <TabsTrigger
                      key={v}
                      value={v}
                      className="flex-1 rounded-none bg-transparent border-0 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white/40 data-[state=active]:text-white data-[state=active]:bg-white/5 transition-colors"
                    >
                      {v}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <TabsContent value="moves" className="mt-0 p-3 max-h-[480px] overflow-auto">
                  <MoveHistory pgn={game.pgn} />
                </TabsContent>
                <TabsContent value="chat" className="mt-0 h-[480px]">
                  <GameChatPanel game={game} currentUser={user} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}