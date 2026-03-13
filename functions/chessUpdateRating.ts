import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function calcElo(ratingA, ratingB, result, k = 32) {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const newA = ratingA + k * (result - expectedA);
  const newB = ratingB + k * ((1 - result) - (1 - expectedA));
  return { newA: Math.round(newA), newB: Math.round(newB) };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { game_id } = await req.json();
    if (!game_id) return Response.json({ error: 'game_id required' }, { status: 400 });

    const game = await base44.asServiceRole.entities.ChessGame.get(game_id);
    if (!game) return Response.json({ error: 'Game not found' }, { status: 404 });

    const [whiteProfiles, blackProfiles] = await Promise.all([
      base44.asServiceRole.entities.ChessClubProfile.filter({ user_email: game.player_white_email }),
      base44.asServiceRole.entities.ChessClubProfile.filter({ user_email: game.player_black_email })
    ]);

    if (!whiteProfiles?.length || !blackProfiles?.length) {
      return Response.json({ error: 'Profiles not found' }, { status: 404 });
    }

    const whiteProfile = whiteProfiles[0];
    const blackProfile = blackProfiles[0];
    const whiteRating = whiteProfile.elo_rating || 1200;
    const blackRating = blackProfile.elo_rating || 1200;

    // result: 1 = white wins, 0 = black wins, 0.5 = draw
    let result = 0.5;
    if (game.status === 'checkmate' || game.status === 'resigned' || game.status === 'timeout') {
      result = game.winner_email === game.player_white_email ? 1 : 0;
    }

    const { newA: newWhite, newB: newBlack } = calcElo(whiteRating, blackRating, result);

    const isDraw = result === 0.5;
    const whiteWon = result === 1;

    await Promise.all([
      base44.asServiceRole.entities.ChessClubProfile.update(whiteProfile.id, {
        elo_rating: newWhite,
        games_played: (whiteProfile.games_played || 0) + 1,
        wins: (whiteProfile.wins || 0) + (whiteWon ? 1 : 0),
        losses: (whiteProfile.losses || 0) + (!whiteWon && !isDraw ? 1 : 0),
        draws: (whiteProfile.draws || 0) + (isDraw ? 1 : 0)
      }),
      base44.asServiceRole.entities.ChessClubProfile.update(blackProfile.id, {
        elo_rating: newBlack,
        games_played: (blackProfile.games_played || 0) + 1,
        wins: (blackProfile.wins || 0) + (!whiteWon && !isDraw ? 1 : 0),
        losses: (blackProfile.losses || 0) + (whiteWon ? 1 : 0),
        draws: (blackProfile.draws || 0) + (isDraw ? 1 : 0)
      })
    ]);

    return Response.json({ success: true, newWhite, newBlack });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});