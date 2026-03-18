import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

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

    // Fetch all nominees and all relevant vote types for the season in parallel
    const [nominees, pairwiseVotes, rankedVotes, spotlightVotes] = await Promise.all([
      base44.asServiceRole.entities.Nominee.filter({ season_id }),
      base44.asServiceRole.entities.PairwiseVote.filter({ season_id }),
      base44.asServiceRole.entities.RankedVote.filter({ season_id }),
      base44.asServiceRole.entities.SpotlightVote.filter({ season_id }),
    ]);
    
    // Calculate nominee stats
    const nomineeStats = {
      total: nominees.length,
      pending: nominees.filter(n => n.status === 'pending').length,
      approved: nominees.filter(n => n.status === 'approved').length,
      rejected: nominees.filter(n => n.status === 'rejected').length,
    };

    // Calculate voting stats by combining all vote types
    const allVoterEmails = [
      ...pairwiseVotes.map(v => v.voter_email),
      ...rankedVotes.map(v => v.voter_email),
      ...spotlightVotes.map(v => v.voter_email)
    ];

    const votingStats = {
      totalVotes: pairwiseVotes.length + rankedVotes.length + spotlightVotes.length,
      uniqueVoters: new Set(allVoterEmails).size,
    };

    return new Response(JSON.stringify({
      success: true,
      data: {
        nomineeStats,
        votingStats,
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in getSeasonAnalytics: ${error.message}`);
    return new Response(JSON.stringify({ success: false, error: 'Internal Server Error', details: error.message }), { status: 500 });
  }
});