import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

const BATCH_SIZE = 50; // Optimized batch size for speed
// Removed delays - we need to prioritize speed over rate limits for this critical function

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

        // Check if baseline name already exists (quick check)
        const existingBaseline = await base44.asServiceRole.entities.ScoreSnapshot.filter({ baseline_name }, null, 1);
        if (existingBaseline.length > 0) {
            return new Response(JSON.stringify({ success: false, error: 'A baseline with this name already exists. Please choose a unique name.' }), { status: 409 });
        }

        // Simplified field sets to reduce payload size and processing time
        const scoreFieldsNominee = [
            'aura_score', 'starpower_score', 'elo_rating', 'borda_score', 'clout', 
            'bio', 'six_word_story', 'name', 'status'
        ];
        
        const scoreFieldsUser = [
            'aura_score', 'starpower_score', 'elo_rating', 'stardust_points', 'clout',
            'full_name', 'handle'
        ];

        let processedCount = 0;
        const startTime = Date.now();

        // Get all data first
        const [allNominees, allUsers] = await Promise.all([
            base44.asServiceRole.entities.Nominee.list(),
            base44.asServiceRole.entities.User.list()
        ]);

        console.log(`Starting baseline save: ${allNominees.length} nominees, ${allUsers.length} users`);

        // Process Nominees in parallel batches
        const nomineePromises = [];
        for (let i = 0; i < allNominees.length; i += BATCH_SIZE) {
            const batch = allNominees.slice(i, i + BATCH_SIZE);
            const nomineeSnapshots = batch.map(nominee => {
                const score_data = {};
                scoreFieldsNominee.forEach(field => {
                    score_data[field] = nominee[field] || (typeof nominee[field] === 'number' ? 0 : '');
                });
                return {
                    baseline_name,
                    snapshot_type: 'nominee',
                    target_id: nominee.id,
                    score_data
                };
            });

            nomineePromises.push(
                base44.asServiceRole.entities.ScoreSnapshot.bulkCreate(nomineeSnapshots)
                    .then(() => batch.length)
                    .catch(error => {
                        console.error(`Error in nominee batch ${i}:`, error);
                        throw error;
                    })
            );
        }

        // Process Users in parallel batches
        const userPromises = [];
        for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
            const batch = allUsers.slice(i, i + BATCH_SIZE);
            const userSnapshots = batch.map(user => {
                const score_data = {};
                scoreFieldsUser.forEach(field => {
                    score_data[field] = user[field] || (typeof user[field] === 'number' ? 0 : '');
                });
                return {
                    baseline_name,
                    snapshot_type: 'user',
                    target_id: user.id,
                    score_data
                };
            });

            userPromises.push(
                base44.asServiceRole.entities.ScoreSnapshot.bulkCreate(userSnapshots)
                    .then(() => batch.length)
                    .catch(error => {
                        console.error(`Error in user batch ${i}:`, error);
                        throw error;
                    })
            );
        }

        // Wait for all batches to complete
        const nomineeResults = await Promise.all(nomineePromises);
        const userResults = await Promise.all(userPromises);

        processedCount = nomineeResults.reduce((sum, count) => sum + count, 0) + 
                        userResults.reduce((sum, count) => sum + count, 0);

        const duration = Date.now() - startTime;
        console.log(`Baseline save completed in ${duration}ms`);

        return new Response(JSON.stringify({ 
            success: true, 
            message: `Baseline '${baseline_name}' created successfully with ${processedCount} snapshots (including bio content) in ${Math.round(duration/1000)}s.` 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Failed to save score baseline:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});