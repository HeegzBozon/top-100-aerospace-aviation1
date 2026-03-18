import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

const BATCH_SIZE = 50;

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { baseline_name } = await req.json();
        if (!baseline_name) {
            return new Response(JSON.stringify({ success: false, error: 'baseline_name is required' }), { status: 400 });
        }

        const allSnapshots = await base44.asServiceRole.entities.ScoreSnapshot.filter({ baseline_name });
        if (allSnapshots.length === 0) {
            return new Response(JSON.stringify({ success: false, error: `Baseline '${baseline_name}' not found.` }), { status: 404 });
        }

        const nomineeUpdates = allSnapshots
            .filter(s => s.snapshot_type === 'nominee')
            .map(s => ({ id: s.target_id, ...s.score_data }));

        const userUpdates = allSnapshots
            .filter(s => s.snapshot_type === 'user')
            .map(s => ({ id: s.target_id, ...s.score_data }));

        let processedCount = 0;
        
        // Restore Nominees (now includes bio content)
        for (let i = 0; i < nomineeUpdates.length; i++) {
            const update = nomineeUpdates[i];
            await base44.asServiceRole.entities.Nominee.update(update.id, update);
            processedCount++;
        }

        // Restore Users
        for (let i = 0; i < userUpdates.length; i++) {
            const update = userUpdates[i];
            await base44.asServiceRole.entities.User.update(update.id, update);
            processedCount++;
        }

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Restored ${processedCount} records from baseline '${baseline_name}' (including bio content).` 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Failed to restore score baseline:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});