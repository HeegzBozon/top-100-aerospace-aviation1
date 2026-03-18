import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

async function runBordaCalculation(serviceRole, season_id) {
    // 1. Fetch all ranked votes for the specific season
    const rankedVotes = await serviceRole.entities.RankedVote.filter({ season_id });
    if (!rankedVotes || rankedVotes.length === 0) {
        return { nomineesUpdated: 0, ballotsProcessed: 0, message: "No ranked choice ballots found for this season." };
    }

    // 2. Calculate Borda points for each nominee
    const bordaScores = {};
    const maxPoints = 100; // Nominee ranked #1 gets 100 points

    for (const vote of rankedVotes) {
        const ballot = vote.ballot || [];
        for (let i = 0; i < ballot.length; i++) {
            const nomineeId = ballot[i];
            const points = maxPoints - i;
            if (points > 0) {
                bordaScores[nomineeId] = (bordaScores[nomineeId] || 0) + points;
            }
        }
    }

    // 3. Batch update nominees with their new Borda score
    const nomineeIds = Object.keys(bordaScores);
    let nomineesUpdated = 0;
    if (nomineeIds.length > 0) {
        const updatePayloads = nomineeIds.map(id => ({
            id: id,
            data: { borda_score: bordaScores[id] || 0 }
        }));
        
        // Update one by one to avoid potential batch issues
        for (const payload of updatePayloads) {
            try {
                await serviceRole.entities.Nominee.update(payload.id, payload.data);
                nomineesUpdated++;
            } catch (e) {
                console.error(`Failed to update Borda score for nominee ${payload.id}:`, e.message);
            }
        }
    }

    return { nomineesUpdated, ballotsProcessed: rankedVotes.length };
}

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    try {
        const { season_id } = await req.json();
        
        if (!season_id) {
            return new Response(JSON.stringify({ success: false, error: 'season_id is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const result = await runBordaCalculation(base44.asServiceRole, season_id);

        return new Response(JSON.stringify({ success: true, ...result }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Borda Calculation Error:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
});