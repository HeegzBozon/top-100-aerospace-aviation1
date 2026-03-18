import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// ELO calculation logic
function calculateEloChange(winnerRating, loserRating, kFactor = 32) {
    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const winnerChange = Math.round(kFactor * (1 - expectedWinner));
    // Loser's change is the negative of the winner's to maintain a zero-sum game
    const loserChange = -winnerChange;
    return { winnerChange, loserChange };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    if (!(await base44.auth.isAuthenticated())) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    const user = await base44.auth.me();
    const { winner_nominee_id, loser_nominee_id, season_id } = await req.json();

    if (!winner_nominee_id || !loser_nominee_id || !season_id) {
        return new Response(JSON.stringify({ success: false, error: 'Missing required parameters.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    try {
        // Fetch winner and loser nominees in parallel
        const [winner, loser] = await Promise.all([
            service.entities.Nominee.get(winner_nominee_id),
            service.entities.Nominee.get(loser_nominee_id)
        ]);

        if (!winner || !loser) {
            return new Response(JSON.stringify({ success: false, error: 'One or both nominees not found.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
        }

        const winnerOldElo = winner.elo_rating || 1200;
        const loserOldElo = loser.elo_rating || 1200;

        const { winnerChange, loserChange } = calculateEloChange(winnerOldElo, loserOldElo);

        const winnerNewElo = winnerOldElo + winnerChange;
        const loserNewElo = loserOldElo + loserChange;

        // Atomically update records and create vote record
        await Promise.all([
            service.entities.PairwiseVote.create({
                voter_email: user.email,
                winner_nominee_id,
                loser_nominee_id,
                season_id,
            }),
            service.entities.Nominee.update(winner_nominee_id, {
                elo_rating: winnerNewElo,
                aura_score: winnerNewElo, // Sync Aura score
                total_wins: (winner.total_wins || 0) + 1,
                pairwise_appearance_count: (winner.pairwise_appearance_count || 0) + 1,
            }),
            service.entities.Nominee.update(loser_nominee_id, {
                elo_rating: loserNewElo,
                aura_score: loserNewElo, // Sync Aura score
                total_losses: (loser.total_losses || 0) + 1,
                pairwise_appearance_count: (loser.pairwise_appearance_count || 0) + 1,
            })
        ]);

        // Notify all admins about the new perception vote
        try {
            const admins = await service.entities.User.filter({ role: 'admin' });
            await Promise.all(admins.map(admin => 
                service.entities.Notification.create({
                    user_email: admin.email,
                    title: '🎯 New Perception Vote',
                    message: `${user.full_name || user.email} voted: ${winner.name} > ${loser.name}`,
                    type: 'info',
                    action_url: '/admin'
                })
            ));
        } catch (notifError) {
            console.error('Failed to create admin notifications:', notifError);
        }

        return new Response(JSON.stringify({ success: true, winnerNewElo, loserNewElo }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error submitting pairwise vote:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});