import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        base44.auth.setToken(authHeader.split(' ')[1]);

        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { season_id, options } = await req.json();

        if (!season_id) {
            return new Response(JSON.stringify({ success: false, error: 'Season ID is required.' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let totalDeleted = 0;

        // Clear nominees
        if (options?.clear_nominees) {
            const nominees = await base44.entities.Nominee.filter({ season_id });
            for (const nominee of nominees.slice(0, 50)) { // Limit to 50 at a time
                try {
                    await base44.entities.Nominee.delete(nominee.id);
                    totalDeleted++;
                } catch (e) {
                    // Continue on error
                }
            }
        }

        // Clear votes
        if (options?.clear_votes) {
            const pairwiseVotes = await base44.entities.PairwiseVote.filter({ season_id });
            for (const vote of pairwiseVotes.slice(0, 100)) { // Limit to 100 at a time
                try {
                    await base44.entities.PairwiseVote.delete(vote.id);
                    totalDeleted++;
                } catch (e) {
                    // Continue on error
                }
            }

            const rankedVotes = await base44.entities.RankedVote.filter({ season_id });
            for (const vote of rankedVotes.slice(0, 100)) { // Limit to 100 at a time
                try {
                    await base44.entities.RankedVote.delete(vote.id);
                    totalDeleted++;
                } catch (e) {
                    // Continue on error
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            count: totalDeleted,
            message: `Cleared ${totalDeleted} records.`
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});