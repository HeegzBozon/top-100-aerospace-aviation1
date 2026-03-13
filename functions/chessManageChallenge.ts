import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, challenge_id, challenged_email, challenged_name, game_type, time_control, bot_difficulty } = await req.json();

    // CREATE challenge
    if (action === 'create') {
      if (!challenged_email) return Response.json({ error: 'challenged_email required' }, { status: 400 });
      const challenge = await base44.entities.ChessChallenge.create({
        challenger_email: user.email,
        challenger_name: user.full_name,
        challenged_email,
        challenged_name: challenged_name || challenged_email,
        status: 'pending',
        game_type: game_type || 'turn_based',
        time_control: time_control || '10+0'
      });
      return Response.json({ success: true, challenge });
    }

    // START BOT GAME — must be checked before the challenge_id guard
    if (action === 'start_bot_game') {
      const difficulty = bot_difficulty || 'simple';
      const botEmail = `bot.${difficulty}@chessclub.internal`;
      const botNames = { simple: 'Rookie', intermediate: 'Strategist', advanced: 'Commander' };
      const botName = botNames[difficulty] || 'Bot';

      const userIsWhite = Math.random() > 0.5;
      const game = await base44.asServiceRole.entities.ChessGame.create({
        player_white_email: userIsWhite ? user.email : botEmail,
        player_white_name: userIsWhite ? user.full_name : botName,
        player_black_email: userIsWhite ? botEmail : user.email,
        player_black_name: userIsWhite ? botName : user.full_name,
        game_type: 'turn_based',
        time_control: 'unlimited',
        status: 'active',
        is_bot_game: true,
        bot_difficulty: difficulty,
        last_move_at: new Date().toISOString()
      });

      // If bot is white, trigger its first move immediately
      if (!userIsWhite) {
        await base44.asServiceRole.functions.invoke('chessBotMove', { game_id: game.id });
      }

      return Response.json({ success: true, game });
    }

    if (!challenge_id) return Response.json({ error: 'challenge_id required' }, { status: 400 });
    const challenge = await base44.asServiceRole.entities.ChessChallenge.get(challenge_id);
    if (!challenge) return Response.json({ error: 'Challenge not found' }, { status: 404 });

    // WITHDRAW (challenger only)
    if (action === 'withdraw') {
      if (challenge.challenger_email !== user.email) return Response.json({ error: 'Forbidden' }, { status: 403 });
      await base44.asServiceRole.entities.ChessChallenge.update(challenge_id, { status: 'withdrawn' });
      return Response.json({ success: true });
    }

    // DECLINE (challenged only)
    if (action === 'decline') {
      if (challenge.challenged_email !== user.email) return Response.json({ error: 'Forbidden' }, { status: 403 });
      await base44.asServiceRole.entities.ChessChallenge.update(challenge_id, { status: 'declined' });
      return Response.json({ success: true });
    }

    // ACCEPT (challenged only) — creates game, randomly assigns colors
    if (action === 'accept') {
      if (challenge.challenged_email !== user.email) return Response.json({ error: 'Forbidden' }, { status: 403 });
      if (challenge.status !== 'pending') return Response.json({ error: 'Challenge no longer pending' }, { status: 400 });

      const whiteIsChallenger = Math.random() > 0.5;
      const game = await base44.asServiceRole.entities.ChessGame.create({
        player_white_email: whiteIsChallenger ? challenge.challenger_email : challenge.challenged_email,
        player_white_name: whiteIsChallenger ? challenge.challenger_name : challenge.challenged_name,
        player_black_email: whiteIsChallenger ? challenge.challenged_email : challenge.challenger_email,
        player_black_name: whiteIsChallenger ? challenge.challenged_name : challenge.challenger_name,
        game_type: challenge.game_type,
        time_control: challenge.time_control,
        status: 'active',
        challenge_id,
        last_move_at: new Date().toISOString()
      });

      await base44.asServiceRole.entities.ChessChallenge.update(challenge_id, { status: 'accepted', game_id: game.id });

      // Ensure both players have ChessClubProfiles
      for (const email of [challenge.challenger_email, challenge.challenged_email]) {
        const profiles = await base44.asServiceRole.entities.ChessClubProfile.filter({ user_email: email });
        if (!profiles || profiles.length === 0) {
          await base44.asServiceRole.entities.ChessClubProfile.create({
            user_id: email,
            user_email: email,
            display_name: email,
            elo_rating: 1200
          });
        }
      }

      return Response.json({ success: true, game });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});