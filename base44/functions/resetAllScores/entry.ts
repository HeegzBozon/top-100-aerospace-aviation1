import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

const BATCH_SIZE = 25;

async function processInBatches(items, actionFunction) {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const promises = batch.map(item => actionFunction(item));
        await Promise.all(promises);
    }
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const [allUsers, allNominees, allStandings] = await Promise.all([
            service.entities.User.list(),
            service.entities.Nominee.list(),
            service.entities.Standing.list(),
        ]);

        await processInBatches(allUsers, (user) => service.entities.User.update(user.id, {
            elo_rating: 1000,
            stardust_points: 0,
            clout: 0,
            starpower_score: 0,
            aura_score: 0,
            aura_rank_name: "Bronze I-III",
            direct_vote_nominee_id: null,
        }));

        await processInBatches(allNominees, (nominee) => service.entities.Nominee.update(nominee.id, {
            elo_rating: 1200,
            borda_score: 0,
            direct_vote_count: 0,
            pairwise_appearance_count: 0,
            total_votes: 0,
            rising_star_count: 0,
            rock_star_count: 0,
            super_star_count: 0,
            north_star_count: 0,
            endorsement_score: 0,
            clout: 0,
            starpower_score: 0,
            aura_score: 0,
            total_spotlights: 0,
            total_wins: 0,
            total_losses: 0,
            win_percentage: 0,
        }));

        if (allStandings.length > 0) {
            await processInBatches(allStandings, (standing) => service.entities.Standing.delete(standing.id));
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Successfully reset scores for ${allUsers.length} users and ${allNominees.length} nominees. Cleared ${allStandings.length} daily standings.` 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Failed to reset all scores:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});