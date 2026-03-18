import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// Standard ELO calculation function
function calculateEloChange(winnerRating, loserRating, kFactor = 32) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  
  const winnerChange = Math.round(kFactor * (1 - expectedWinner));
  const loserChange = Math.round(kFactor * (0 - expectedLoser));
  
  return { winnerChange, loserChange };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const serviceRoleClient = base44.asServiceRole;

    // Auth check
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { page = 1, limit = 25 } = await req.json();
    const offset = (page - 1) * limit;

    // Step 1: Fetch the paginated votes
    const votes = await serviceRoleClient.entities.PairwiseVote.filter({}, '-created_date', limit, offset);

    // Step 1b: Get accurate total count by paginating through all records
    let totalCount = 0;
    let currentBatch = 0;
    const batchSize = 5000;
    let hasMoreBatches = true;
    
    while (hasMoreBatches) {
      const batch = await serviceRoleClient.entities.PairwiseVote.filter({}, '', batchSize, currentBatch * batchSize);
      totalCount += batch.length;
      hasMoreBatches = batch.length === batchSize;
      currentBatch++;
    }

    if (!votes || votes.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: [],
        hasMore: false,
        totalCount: 0,
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // Step 2: Gather unique IDs from the votes
    const voterEmails = [...new Set(votes.map(v => v.voter_email).filter(Boolean))];
    const nomineeIds = [...new Set(votes.flatMap(v => [v.winner_nominee_id, v.loser_nominee_id]).filter(Boolean))];
    
    // Step 3: Fetch only the relevant users and nominees
    const [relevantUsers, relevantNominees] = await Promise.all([
      voterEmails.length > 0 ? serviceRoleClient.entities.User.filter({ email: { $in: voterEmails } }) : Promise.resolve([]),
      nomineeIds.length > 0 ? serviceRoleClient.entities.Nominee.filter({ id: { $in: nomineeIds } }) : Promise.resolve([])
    ]);

    // Step 4: Create efficient lookup maps
    const userMap = relevantUsers.reduce((acc, user) => {
      acc[user.email] = user.full_name || user.email;
      return acc;
    }, {});

    const nomineeMap = relevantNominees.reduce((acc, nominee) => {
      acc[nominee.id] = {
        name: nominee.name || 'Unknown Nominee',
        eloRating: nominee.elo_rating || 1200
      };
      return acc;
    }, {});
    
    // Step 5: Process the votes into ledger entries
    const ledgerEntries = votes.map(vote => {
      const winner = nomineeMap[vote.winner_nominee_id];
      const loser = nomineeMap[vote.loser_nominee_id];
      
      let eloChanges = { winnerChange: 0, loserChange: 0 };
      if (winner && loser) {
        eloChanges = calculateEloChange(winner.eloRating, loser.eloRating);
      }

      return {
        id: vote.id,
        timestamp: vote.created_date,
        voterName: userMap[vote.voter_email] || vote.voter_email || 'Unknown Voter',
        winnerName: winner?.name || 'Deleted Nominee',
        loserName: loser?.name || 'Deleted Nominee',
        winnerEloChange: eloChanges.winnerChange,
        loserEloChange: eloChanges.loserChange,
        winnerCurrentElo: winner?.eloRating || 'N/A',
        loserCurrentElo: loser?.eloRating || 'N/A',
        winnerCurrentRank: null, // Removed for performance
        loserCurrentRank: null,  // Removed for performance
      };
    });

    return new Response(JSON.stringify({
      success: true,
      data: ledgerEntries,
      hasMore: votes.length === limit,
      totalCount,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in getVoteLedgerData:', error.stack || error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to process ledger data.', details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});