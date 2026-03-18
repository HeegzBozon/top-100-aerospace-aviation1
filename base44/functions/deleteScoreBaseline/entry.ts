import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
    }

    try {
        const { baseline_name } = await req.json();
        if (!baseline_name) {
            return new Response(JSON.stringify({ success: false, error: 'baseline_name is required' }), { status: 400 });
        }

        const snapshotsToDelete = await base44.asServiceRole.entities.ScoreSnapshot.filter({ baseline_name });
        
        if (snapshotsToDelete.length > 0) {
            const idsToDelete = snapshotsToDelete.map(s => s.id);
            // Assuming bulkDelete exists and takes an array of IDs. If not, this needs to be a loop.
            // Let's implement as a loop for safety as bulkDelete might not be in the SDK yet.
            for (const id of idsToDelete) {
                await base44.asServiceRole.entities.ScoreSnapshot.delete(id);
            }
        }

        return new Response(JSON.stringify({ success: true, message: `Deleted ${snapshotsToDelete.length} records for baseline '${baseline_name}'.` }), { status: 200 });

    } catch (error) {
        console.error('Failed to delete score baseline:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});