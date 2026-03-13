import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

const BATCH_SIZE = 25;

async function processInBatches(items, actionFunction) {
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const promises = batch.map(item => actionFunction(item));
        await Promise.all(promises);
        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
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
        // Fetch all data that needs to be reset/cleared
        const [
            allUsers, 
            allNominees, 
            allStandings, 
            allPairwiseVotes, 
            allRankedVotes, 
            allDirectVotes,
            allSpotlightVotes,
            allEndorsements,
            allRewardGrants,
            allHabitLogs,
            allReflections
        ] = await Promise.all([
            service.entities.User.list(),
            service.entities.Nominee.list(),
            service.entities.Standing.list(),
            service.entities.PairwiseVote.list(),
            service.entities.RankedVote.list().catch(() => []),
            service.entities.Vote.list().catch(() => []),
            service.entities.SpotlightVote.list().catch(() => []),
            service.entities.Endorsement.list().catch(() => []),
            service.entities.RewardGrant.list().catch(() => []),
            service.entities.HabitLog.list().catch(() => []),
            service.entities.Reflection.list().catch(() => [])
        ]);

        // Reset all users to default state
        await processInBatches(allUsers, (user) => service.entities.User.update(user.id, {
            elo_rating: 1000,
            stardust_points: 0,
            clout: 0,
            starpower_score: 0,
            aura_score: 0,
            aura_rank_name: "Bronze I-III",
            direct_vote_nominee_id: null,
            merit_score: 0,
            last_stardust_activity: null,
            profile_completion_bonus_claimed: false,
            nominee_claim_bonus_claimed: false,
            upvoted_tips: []
        }));

        // Reset all nominees to default state
        await processInBatches(allNominees, (nominee) => service.entities.Nominee.update(nominee.id, {
            elo_rating: 1200,
            borda_score: 0,
            direct_vote_count: 0,
            community_elo_rating: 1200,
            nominee_elo_rating: 1200,
            community_borda_score: 0,
            nominee_borda_score: 0,
            community_direct_score: 0,
            nominee_direct_score: 0,
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
            is_on_fire: false
        }));

        // Delete all voting records
        if (allPairwiseVotes.length > 0) {
            await processInBatches(allPairwiseVotes, (vote) => service.entities.PairwiseVote.delete(vote.id));
        }

        if (allRankedVotes.length > 0) {
            await processInBatches(allRankedVotes, (vote) => service.entities.RankedVote.delete(vote.id));
        }

        if (allDirectVotes.length > 0) {
            await processInBatches(allDirectVotes, (vote) => service.entities.Vote.delete(vote.id));
        }

        if (allSpotlightVotes.length > 0) {
            await processInBatches(allSpotlightVotes, (vote) => service.entities.SpotlightVote.delete(vote.id));
        }

        if (allEndorsements.length > 0) {
            await processInBatches(allEndorsements, (endorsement) => service.entities.Endorsement.delete(endorsement.id));
        }

        // Delete all standings/monitoring data
        if (allStandings.length > 0) {
            await processInBatches(allStandings, (standing) => service.entities.Standing.delete(standing.id));
        }

        // Delete all reward grants (stardust transaction history)
        if (allRewardGrants.length > 0) {
            await processInBatches(allRewardGrants, (grant) => service.entities.RewardGrant.delete(grant.id));
        }

        // Delete all habit logs and reflections (monitoring dashboard data)
        if (allHabitLogs.length > 0) {
            await processInBatches(allHabitLogs, (log) => service.entities.HabitLog.delete(log.id));
        }

        if (allReflections.length > 0) {
            await processInBatches(allReflections, (reflection) => service.entities.Reflection.delete(reflection.id));
        }

        const summary = {
            users_reset: allUsers.length,
            nominees_reset: allNominees.length,
            pairwise_votes_deleted: allPairwiseVotes.length,
            ranked_votes_deleted: allRankedVotes.length,
            direct_votes_deleted: allDirectVotes.length,
            spotlight_votes_deleted: allSpotlightVotes.length,
            endorsements_deleted: allEndorsements.length,
            standings_deleted: allStandings.length,
            reward_grants_deleted: allRewardGrants.length,
            habit_logs_deleted: allHabitLogs.length,
            reflections_deleted: allReflections.length
        };

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Factory reset completed successfully!`,
            summary
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Factory reset failed:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});