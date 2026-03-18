import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), { 
                status: 403, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const { season_id } = await req.json();
        if (!season_id) {
            return new Response(JSON.stringify({ success: false, error: 'season_id is required' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const service = base44.asServiceRole;
        
        // Fetch all ranked votes for the season
        const rankedVotes = await service.entities.RankedVote.filter({ season_id });
        
        // Fetch all nominees for the season
        const nominees = await service.entities.Nominee.filter({ season_id, status: 'active' });
        
        // Calculate analytics
        const totalBallots = rankedVotes.length;
        const totalVoters = new Set(rankedVotes.map(vote => vote.voter_email)).size;
        
        // Calculate average ballot length
        const ballotLengths = rankedVotes.map(vote => vote.ballot ? vote.ballot.length : 0);
        const avgBallotLength = ballotLengths.length > 0 ? 
            Math.round(ballotLengths.reduce((sum, len) => sum + len, 0) / ballotLengths.length * 10) / 10 : 0;
        
        // Find most commonly ranked nominees (top 5)
        const nomineeAppearances = {};
        rankedVotes.forEach(vote => {
            if (vote.ballot) {
                vote.ballot.forEach(nomineeId => {
                    nomineeAppearances[nomineeId] = (nomineeAppearances[nomineeId] || 0) + 1;
                });
            }
        });
        
        const topRankedNominees = Object.entries(nomineeAppearances)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([nomineeId, count]) => {
                const nominee = nominees.find(n => n.id === nomineeId);
                return {
                    nominee_id: nomineeId,
                    nominee_name: nominee ? nominee.name : 'Unknown',
                    appearances: count,
                    percentage: Math.round((count / totalBallots) * 100)
                };
            });
        
        // Find top Borda score nominees
        const topBordaNominees = nominees
            .filter(n => n.borda_score > 0)
            .sort((a, b) => (b.borda_score || 0) - (a.borda_score || 0))
            .slice(0, 10)
            .map(nominee => ({
                nominee_id: nominee.id,
                nominee_name: nominee.name,
                borda_score: nominee.borda_score,
                aura_score: nominee.aura_score
            }));

        return new Response(JSON.stringify({
            success: true,
            analytics: {
                total_ballots: totalBallots,
                total_voters: totalVoters,
                avg_ballot_length: avgBallotLength,
                participation_rate: nominees.length > 0 ? Math.round((totalVoters / nominees.length) * 100) : 0,
                top_ranked_nominees: topRankedNominees,
                top_borda_nominees: topBordaNominees
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('RCV Analytics error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});