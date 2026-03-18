import { createClient } from 'npm:@base44/sdk@0.1.0';
import { awardStardust } from './awardStardust.js';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }

        const { sessionId, completedObjectives } = await req.json();

        if (!sessionId || !completedObjectives || !Array.isArray(completedObjectives)) {
            return new Response(JSON.stringify({ error: '`sessionId` and `completedObjectives` (array) are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update HuddleSession status
        await base44.entities.HuddleSession.update(sessionId, {
            status: 'completed',
            end_ts: new Date().toISOString()
        });

        // Update DailyObjective statuses and linked PersonalTasks
        for (const objective of completedObjectives) {
            if (objective.id) {
                await base44.entities.DailyObjective.update(objective.id, {
                    status: 'completed'
                });

                // If the objective was linked to a personal task, update it
                if (objective.personal_task_id) {
                    try {
                        await base44.entities.PersonalTask.update(objective.personal_task_id, {
                            status: 'done'
                        });
                    } catch (e) {
                        console.error(`Failed to update personal task ${objective.personal_task_id}:`, e.message);
                    }
                }
            }
        }
        
        // Award Stardust for completing the huddle
        const stardustResult = await awardStardust({
            user_email: user.email,
            action_type: 'huddle_completed',
            multiplier: completedObjectives.length
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Huddle session completed!',
            stardust_earned: stardustResult?.points_awarded || 0,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in finishHuddleSession function:', error.message);
        return new Response(JSON.stringify({ 
            success: false,
            error: 'Failed to finish huddle session',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});