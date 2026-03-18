import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

/**
 * Processes a single batch of nominees to update their Aura score.
 * This is the "worker" function.
 * @param {object} serviceRole - The Base44 service role client.
 * @param {string} seasonId - The ID of the season to process.
 * @param {number} batchIndex - The index of the batch to process (0-based).
 * @returns {Promise<{processed: number}>} - The number of nominees processed in this batch.
 */
export async function runProcessBatch(serviceRole, seasonId, batchIndex) {
    const BATCH_SIZE = 50;
    const offset = batchIndex * BATCH_SIZE;

    console.log(`[BATCH ${batchIndex}] Processing... Offset: ${offset}, Limit: ${BATCH_SIZE}`);

    const nominees = await serviceRole.entities.Nominee.filter(
        { season_id: seasonId }, 
        '-created_date', 
        BATCH_SIZE, 
        offset
    );

    if (!nominees || nominees.length === 0) {
        console.log(`[BATCH ${batchIndex}] No nominees found. End of processing for this chain.`);
        return { processed: 0 };
    }

    let processedCount = 0;
    for (const nominee of nominees) {
        try {
            const elo = nominee.elo_rating || 1200;
            // Simple logic: Aura = ELO
            await serviceRole.entities.Nominee.update(nominee.id, { aura_score: elo });
            processedCount++;
        } catch (error) {
            console.error(`[BATCH ${batchIndex}] Error updating ${nominee.name}:`, error.message);
        }
    }

    console.log(`[BATCH ${batchIndex}] Successfully processed ${processedCount} of ${nominees.length} nominees.`);
    return { processed: nominees.length }; // Return the number attempted to see if it was the last batch
}

// This allows the function to be called directly via an endpoint if needed for debugging.
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const { season_id, batch_index } = await req.json();

    if (season_id === undefined || batch_index === undefined) {
        return new Response(JSON.stringify({ success: false, error: 'season_id and batch_index are required' }), { status: 400 });
    }

    try {
        const result = await runProcessBatch(base44.asServiceRole, season_id, batch_index);
        return new Response(JSON.stringify({ success: true, ...result }));
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});