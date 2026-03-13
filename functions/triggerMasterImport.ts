import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

const BATCH_SIZE = 50;

async function processBatch(batch, fieldMapping, jobId) {
    const recordsToCreate = {};
    const entityTypes = [];

    batch.forEach(sourceRecord => {
        let targetEntity = null;
        const targetRecord = {};

        for (const sourceField in fieldMapping) {
            if (sourceRecord.hasOwnProperty(sourceField)) {
                const mapping = fieldMapping[sourceField];
                if (!targetEntity) {
                    targetEntity = mapping.targetEntity;
                }
                targetRecord[mapping.targetField] = sourceRecord[sourceField];
            }
        }
        
        if (targetEntity && Object.keys(targetRecord).length > 0) {
            if (!recordsToCreate[targetEntity]) {
                recordsToCreate[targetEntity] = [];
                entityTypes.push(targetEntity);
            }
            recordsToCreate[targetEntity].push(targetRecord);
        }
    });

    const processOrder = ['User', 'Nominee', 'PairwiseVote', 'RankedVote', 'DirectVote'];
    let batchErrors = 0;

    for (const entityType of processOrder) {
        if (recordsToCreate[entityType] && recordsToCreate[entityType].length > 0) {
            try {
                if (base44.entities[entityType]) {
                    await base44.entities[entityType].bulkCreate(recordsToCreate[entityType]);
                } else {
                    console.warn(`Entity type "${entityType}" from mapping is not a valid entity.`);
                    batchErrors += recordsToCreate[entityType].length;
                }
            } catch (error) {
                console.error(`Error bulk inserting ${entityType}:`, error);
                batchErrors += recordsToCreate[entityType].length;
            }
        }
    }
    
    return {
        success: batch.length - batchErrors,
        failed: batchErrors,
    };
}


Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        
        base44.auth.setToken(authHeader.split(' ')[1]);
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const { data, fieldMapping, jobName } = await req.json();

        const { data: job, error: jobError } = await base44.entities.ImportJob.create({
            name: jobName,
            total_records: data.length,
            status: 'running',
            field_mapping: fieldMapping,
            started_at: new Date().toISOString(),
        });

        if (jobError) {
            throw new Error(`Failed to create import job: ${jobError.message}`);
        }

        (async () => {
            let total_processed = 0;
            let total_failed = 0;

            for (let i = 0; i < data.length; i += BATCH_SIZE) {
                const batch = data.slice(i, i + BATCH_SIZE);
                const result = await processBatch(batch, fieldMapping, job.id);
                
                total_processed += result.success;
                total_failed += result.failed;

                await base44.entities.ImportJob.update(job.id, {
                    processed_records: total_processed,
                    failed_records: total_failed,
                    progress_percentage: Math.round(((i + batch.length) / data.length) * 100),
                });
            }

            await base44.entities.ImportJob.update(job.id, {
                status: 'completed',
                completed_at: new Date().toISOString(),
            });
        })();

        return new Response(JSON.stringify({ success: true, jobId: job.id }), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        });

    } catch (error) {
        console.error('Error in triggerMasterImport function:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        });
    }
});