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

        const { wins } = await req.json();

        if (!wins || !Array.isArray(wins) || wins.length === 0) {
            return new Response(JSON.stringify({ error: 'Invalid payload: wins array is required.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Find or create a Huddle Session for the user for today
        const today = new Date().toISOString().split('T')[0];
        let session;

        const existingSessions = await base44.entities.HuddleSession.filter({
            team_id: user.email,
            date: today,
            mode: 'solo'
        }, '-created_date', 1);
        
        if (existingSessions.length > 0) {
            session = existingSessions[0];
        } else {
            session = await base44.entities.HuddleSession.create({
                date: today,
                team_id: user.email,
                mode: 'solo',
                start_ts: new Date().toISOString(),
            });
        }
        
        if (!session || !session.id) {
             return new Response(JSON.stringify({ error: 'Failed to create or find huddle session.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        }

        // Prepare DailyObjective records for bulk creation
        const objectivesToCreate = wins.map(win => ({
            session_id: session.id,
            user_email: user.email,
            title: win.title,
            success_criteria: win.criteria,
            est_minutes: 15, // Default for this flow
            status: 'planned',
            eisenhower: win.eisenhower || { urgent: false, important: false },
        }));

        await base44.entities.DailyObjective.bulkCreate(objectivesToCreate);

        return new Response(JSON.stringify({ success: true, message: 'Daily wins saved successfully.', sessionId: session.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in saveDailyWins function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});