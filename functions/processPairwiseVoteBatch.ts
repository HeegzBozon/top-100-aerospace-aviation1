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

        const { pairwise_votes, importJobId } = await req.json();
        
        let processed = 0;
        let failed = 0;
        const errors = [];

        // Update job status to running
        const currentJob = await base44.entities.ImportJob.filter({ id: importJobId });
        if (currentJob.length > 0) {
            const job = currentJob[0];
            const updatedEntityProgress = {
                ...job.entity_progress,
                pairwise_votes: { status: 'running', processed: 0, failed: 0, total: pairwise_votes.length }
            };

            await base44.entities.ImportJob.update(importJobId, {
                entity_progress: updatedEntityProgress
            });
        }

        // Process in smaller chunks to avoid timeouts
        const chunkSize = 50;
        for (let i = 0; i < pairwise_votes.length; i += chunkSize) {
            const chunk = pairwise_votes.slice(i, i + chunkSize);
            
            for (const voteData of chunk) {
                try {
                    await base44.entities.PairwiseVote.create(voteData);
                    processed++;
                } catch (error) {
                    failed++;
                    errors.push(`Vote ${i + processed + failed}: ${error.message}`);
                }
            }

            // Update progress every chunk
            if (currentJob.length > 0) {
                const job = currentJob[0];
                const updatedEntityProgress = {
                    ...job.entity_progress,
                    pairwise_votes: {
                        status: 'running',
                        processed,
                        failed,
                        total: pairwise_votes.length
                    }
                };

                await base44.entities.ImportJob.update(importJobId, {
                    entity_progress: updatedEntityProgress,
                    processed_records: job.processed_records - (job.entity_progress.pairwise_votes?.processed || 0) + processed,
                    failed_records: job.failed_records - (job.entity_progress.pairwise_votes?.failed || 0) + failed
                });
            }
        }

        // Final update
        if (currentJob.length > 0) {
            const job = await base44.entities.ImportJob.filter({ id: importJobId });
            if (job.length > 0) {
                const updatedEntityProgress = {
                    ...job[0].entity_progress,
                    pairwise_votes: {
                        status: 'completed',
                        processed,
                        failed,
                        total: pairwise_votes.length
                    }
                };

                await base44.entities.ImportJob.update(importJobId, {
                    entity_progress: updatedEntityProgress,
                    processed_records: job[0].processed_records - (job[0].entity_progress.pairwise_votes?.processed || 0) + processed,
                    failed_records: job[0].failed_records - (job[0].entity_progress.pairwise_votes?.failed || 0) + failed
                });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            processed,
            failed,
            errors: errors.slice(0, 10)
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