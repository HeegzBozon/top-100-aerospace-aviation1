import { createClient } from 'npm:@base44/sdk@0.1.0';

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

        const { dailyWins, focusTime } = await req.json();

        if (!dailyWins || !Array.isArray(dailyWins)) {
            return new Response(JSON.stringify({ error: '`dailyWins` are required and must be an array.' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const today = new Date().toISOString().split('T')[0];

        const huddleSession = await base44.entities.HuddleSession.create({
            date: today,
            team_id: user.email,
            mode: 'solo',
            start_ts: new Date().toISOString(),
            duration: focusTime || 25,
            status: 'in_progress',
        });
        
        const huddleObjectives = dailyWins
            .filter(win => win && typeof win === 'object' && win.title && win.title.trim() !== '')
            .map(win => ({
                session_id: huddleSession.id,
                user_email: user.email,
                title: win.title,
                personal_task_id: win.personal_task_id || null,
                success_criteria: 'Completed during huddle session',
                status: 'planned'
            }));

        if (huddleObjectives.length > 0) {
            await base44.entities.DailyObjective.bulkCreate(huddleObjectives);
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Huddle session started successfully.',
            session: huddleSession
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in startHuddleSession function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});