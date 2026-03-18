import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { Chess } from 'npm:chess.js@1.0.0';

// ─── Piece values for evaluation ───────────────────────────────
const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-square tables (from white's perspective; flip for black)
const PST = {
  p: [
     0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
     5,  5, 10, 25, 25, 10,  5,  5,
     0,  0,  0, 20, 20,  0,  0,  0,
     5, -5,-10,  0,  0,-10, -5,  5,
     5, 10, 10,-20,-20, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
  ],
  n: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ],
  b: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ],
  r: [
     0,  0,  0,  0,  0,  0,  0,  0,
     5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     0,  0,  0,  5,  5,  0,  0,  0
  ],
  q: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ],
  k: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
  ]
};

function squareIndex(square) {
  const file = square.charCodeAt(0) - 97; // a=0..h=7
  const rank = parseInt(square[1]) - 1;   // 1=0..8=7
  return (7 - rank) * 8 + file;
}

function evaluateBoard(chess) {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -99999 : 99999;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const sq = squareIndex(piece.square);
      const pst = PST[piece.type];
      const pstVal = piece.color === 'w' ? pst[sq] : pst[63 - sq];
      const val = PIECE_VALUES[piece.type] + pstVal;
      score += piece.color === 'w' ? val : -val;
    }
  }
  return score;
}

function minimax(chess, depth, alpha, beta, maximizing) {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess);
  const moves = chess.moves({ verbose: false });
  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function pickBotMove(chess, difficulty) {
  const moves = chess.moves({ verbose: false });
  if (!moves.length) return null;

  if (difficulty === 'simple') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === 'advanced' ? 4 : 2;
  const isMaximizing = chess.turn() === 'w';

  let bestMove = null;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  // Shuffle for variety at same score
  const shuffled = [...moves].sort(() => Math.random() - 0.5);

  for (const move of shuffled) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();
    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

// ─── Handler ───────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { game_id } = await req.json();
    if (!game_id) return Response.json({ error: 'game_id required' }, { status: 400 });

    const game = await base44.asServiceRole.entities.ChessGame.get(game_id);
    if (!game) return Response.json({ error: 'Game not found' }, { status: 404 });
    if (!game.is_bot_game) return Response.json({ error: 'Not a bot game' }, { status: 400 });
    if (game.status !== 'active') return Response.json({ error: 'Game not active' }, { status: 400 });

    // Ensure it's actually the bot's turn
    const chess = new Chess(game.current_fen);
    const botEmail = game.player_white_email.startsWith('bot.')
      ? game.player_white_email
      : game.player_black_email;
    const botColor = game.player_white_email === botEmail ? 'w' : 'b';
    if (chess.turn() !== botColor) {
      return Response.json({ message: 'Not bot turn', skipped: true });
    }

    const move = pickBotMove(chess, game.bot_difficulty || 'simple');
    if (!move) return Response.json({ error: 'No legal moves' }, { status: 400 });

    chess.move(move);

    let status = 'active';
    let winner_email = null;
    if (chess.isCheckmate()) {
      status = 'checkmate';
      winner_email = botEmail;
    } else if (chess.isStalemate() || chess.isDraw()) {
      status = 'draw';
    }

    const updatedGame = await base44.asServiceRole.entities.ChessGame.update(game_id, {
      current_fen: chess.fen(),
      pgn: chess.pgn(),
      status,
      winner_email,
      last_move_at: new Date().toISOString(),
      move_count: (game.move_count || 0) + 1
    });

    if (status !== 'active') {
      await base44.asServiceRole.functions.invoke('chessUpdateRating', { game_id });
    }

    return Response.json({ success: true, game: updatedGame, move });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});