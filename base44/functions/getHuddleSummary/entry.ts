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

        const url = new URL(req.url);
        const date = url.searchParams.get('date');

        if (!date) {
            return new Response(JSON.stringify({ error: 'date parameter is required (YYYY-MM-DD format).' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Get sessions for the specified date
        const sessions = await base44.entities.HuddleSession.filter({ 
            date: date,
            team_id: user.email // For solo mode; in team mode, this would be different
        });

        if (sessions.length === 0) {
            return new Response(JSON.stringify({ 
                success: true,
                message: 'No huddle sessions found for this date.',
                summary: null
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const session = sessions[0]; // Get the most recent session for the day

        // Get related data
        const [objectives, updates, decisions, blockers] = await Promise.all([
            base44.entities.DailyObjective.filter({ session_id: session.id }),
            base44.entities.HuddleUpdate.filter({ session_id: session.id }),
            base44.entities.Decision.filter({ session_id: session.id }),
            base44.entities.Blocker.filter({ session_id: session.id })
        ]);

        const kpis = {
            duration_minutes: session.duration || 0,
            objectives_count: objectives.length,
            objectives_completed: objectives.filter(o => o.status === 'completed').length,
            completion_rate: objectives.length > 0 ? objectives.filter(o => o.status === 'completed').length / objectives.length : 0,
            blockers_count: blockers.length,
            decisions_count: decisions.length,
            focus_score: session.vibe_snapshot?.focus_average || 0,
            mood_score: session.vibe_snapshot?.mood_average || 0
        };

        const summary = {
            session: session,
            objectives: objectives,
            updates: updates,
            decisions: decisions,
            blockers: blockers,
            kpis: kpis
        };

        return new Response(JSON.stringify({ 
            success: true,
            summary: summary,
            message: 'Huddle summary retrieved successfully.' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in getHuddleSummary function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});