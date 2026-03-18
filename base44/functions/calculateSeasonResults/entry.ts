import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// A simple scoring logic: 2 points for a pairwise win, 1 for a spotlight vote.
const SCORE_CONFIG = {
  PAIRWISE_WIN: 2,
  SPOTLIGHT: 1,
  // Ranked choice would be more complex, so we'll omit it for this simple calculation
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    const { season_id } = await req.json();
    if (!season_id) {
      return new Response(JSON.stringify({ success: false, error: 'Season ID is required' }), { status: 400 });
    }

    // 1. Fetch all votes for the season in parallel
    const [pairwiseVotes, spotlightVotes] = await Promise.all([
      base44.asServiceRole.entities.PairwiseVote.filter({ season_id }),
      base44.asServiceRole.entities.SpotlightVote.filter({ season_id }),
    ]);

    // 2. Calculate scores
    const scores = new Map();

    // Process pairwise votes
    for (const vote of pairwiseVotes) {
      const winnerId = vote.winner_nominee_id;
      scores.set(winnerId, (scores.get(winnerId) || 0) + SCORE_CONFIG.PAIRWISE_WIN);
    }

    // Process spotlight votes
    for (const vote of spotlightVotes) {
      const nomineeId = vote.nominee_id;
      scores.set(nomineeId, (scores.get(nomineeId) || 0) + SCORE_CONFIG.SPOTLIGHT);
    }
    
    // 3. Fetch all nominees for the season
    const nominees = await base44.asServiceRole.entities.Nominee.filter({ season_id });

    // 4. Update nominee scores in batch
    const updatePromises = [];
    for (const nominee of nominees) {
      const finalScore = scores.get(nominee.id) || 0;
      // Using 'borda_score' field to store this calculated final score.
      updatePromises.push(
        base44.asServiceRole.entities.Nominee.update(nominee.id, { borda_score: finalScore })
      );
    }

    await Promise.all(updatePromises);
    
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully calculated and saved results for ${nominees.length} nominees.`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in calculateSeasonResults: ${error.message}`);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
});