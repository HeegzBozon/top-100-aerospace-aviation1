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

        const { users, importJobId } = await req.json();
        
        let processed = 0;
        let failed = 0;
        const errors = [];

        // Update job status to running
        await base44.entities.ImportJob.update(importJobId, {
            entity_progress: {
                users: { status: 'running', processed: 0, failed: 0 }
            }
        });

        for (const userData of users) {
            try {
                // Check if user already exists
                const existingUsers = await base44.entities.User.filter({ email: userData.email });
                
                if (existingUsers.length > 0) {
                    // Update existing user
                    await base44.entities.User.update(existingUsers[0].id, userData);
                } else {
                    // Create new user
                    await base44.entities.User.create(userData);
                }
                processed++;
            } catch (error) {
                failed++;
                errors.push(`User ${userData.email}: ${error.message}`);
            }
        }

        // Update the ImportJob with progress
        const currentJob = await base44.entities.ImportJob.filter({ id: importJobId });
        if (currentJob.length > 0) {
            const job = currentJob[0];
            const updatedEntityProgress = {
                ...job.entity_progress,
                users: {
                    status: 'completed',
                    processed,
                    failed,
                    total: users.length
                }
            };

            await base44.entities.ImportJob.update(importJobId, {
                entity_progress: updatedEntityProgress,
                processed_records: job.processed_records + processed,
                failed_records: job.failed_records + failed
            });
        }

        return new Response(JSON.stringify({
            success: true,
            processed,
            failed,
            errors: errors.slice(0, 10) // Limit error details
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