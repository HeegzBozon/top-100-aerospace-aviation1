
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { runProcessBatch } from './processScoreBatch';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * This is the "master" controller function that orchestrates the batch processing.
 * It determines the active season and calls the worker function in a loop.
 * @param {object} serviceRole - The Base44 service role client.
 */
async function runScheduledUpdate(serviceRole) {
    console.log('[MASTER] Starting full score recalculation...');
    
    const seasons = await serviceRole.entities.Season.list('-start_date');
    const activeSeason = seasons.find(s => ['voting_open', 'active', 'nominations_open'].includes(s.status)) || seasons[0];
    
    if (!activeSeason) {
        throw new Error('No active or valid season found. Aborting.');
    }
    console.log(`[MASTER] Targeting season: ${activeSeason.name} (ID: ${activeSeason.id})`);

    let totalProcessed = 0;
    let batchIndex = 0;
    let keepProcessing = true;
    const MAX_BATCHES = 20; // Safety break to prevent infinite loops

    console.log(`[MASTER] Processing all nominees in batches...`);

    while (keepProcessing && batchIndex < MAX_BATCHES) {
        const result = await runProcessBatch(serviceRole, activeSeason.id, batchIndex);
        const processedInBatch = result.processed || 0;
        totalProcessed += processedInBatch;
        
        console.log(`[MASTER] Batch ${batchIndex} complete. Processed in batch: ${processedInBatch}`);

        if (processedInBatch === 0) {
            keepProcessing = false;
            console.log('[MASTER] Last batch was empty. Finishing.');
        } else {
            batchIndex++;
            await sleep(200); // Small delay to be nice to the API
        }
    }

    const message = `Recalculation complete. Total nominees processed: ${totalProcessed}`;
    console.log(`[MASTER] ${message}`);
    return { success: true, message, processed: totalProcessed };
}

export { runScheduledUpdate };

// This endpoint is for the cron job scheduler.
Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    try {
        const result = await runScheduledUpdate(base44.asServiceRole);
        return new Response(JSON.stringify(result), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('[MASTER CRON] Cron job failed:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500, headers: { 'Content-Type': 'application/json' }
        });
    }
});
