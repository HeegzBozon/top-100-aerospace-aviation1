import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { Chess } from 'npm:chess.js@1.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { game_id, move } = await req.json();
    if (!game_id || !move) return Response.json({ error: 'Missing game_id or move' }, { status: 400 });

    const game = await base44.asServiceRole.entities.ChessGame.get(game_id);
    if (!game) return Response.json({ error: 'Game not found' }, { status: 404 });
    if (game.status !== 'active') return Response.json({ error: 'Game is not active' }, { status: 400 });

    // Verify it's the user's turn
    const chess = new Chess(game.current_fen);
    const turn = chess.turn(); // 'w' or 'b'
    const isWhite = game.player_white_email === user.email;
    const isBlack = game.player_black_email === user.email;
    if (!isWhite && !isBlack) return Response.json({ error: 'You are not a player in this game' }, { status: 403 });
    if (turn === 'w' && !isWhite) return Response.json({ error: 'Not your turn' }, { status: 400 });
    if (turn === 'b' && !isBlack) return Response.json({ error: 'Not your turn' }, { status: 400 });

    // Attempt move
    const result = chess.move(move);
    if (!result) return Response.json({ error: 'Illegal move' }, { status: 400 });

    // Determine new status
    let status = 'active';
    let winner_email = null;
    if (chess.isCheckmate()) {
      status = 'checkmate';
      winner_email = user.email;
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

    // If game ended, trigger Elo update
    if (status !== 'active') {
      await base44.asServiceRole.functions.invoke('chessUpdateRating', { game_id });
    }

    return Response.json({ success: true, game: updatedGame });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});