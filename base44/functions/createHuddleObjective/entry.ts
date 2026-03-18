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

        const { 
            session_id, 
            title, 
            success_criteria, 
            wsjf = { bv: 5, tc: 5, rr: 5, size: 5 },
            eisenhower = { urgent: false, important: false },
            est_minutes = 15,
            linked_ticket 
        } = await req.json();

        if (!session_id || !title || !success_criteria) {
            return new Response(JSON.stringify({ error: 'session_id, title, and success_criteria are required.' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Calculate WSJF score: (BV + TC + RR) / Size
        const wsjfScore = (wsjf.bv + wsjf.tc + wsjf.rr) / Math.max(wsjf.size, 1);

        const objective = await base44.entities.DailyObjective.create({
            session_id: session_id,
            user_email: user.email,
            title: title,
            success_criteria: success_criteria,
            wsjf: wsjf,
            eisenhower: eisenhower,
            est_minutes: est_minutes,
            linked_ticket: linked_ticket,
            status: 'planned'
        });

        // TODO: Phase 2 - If team capacity < 80%, auto-schedule to sprint
        // This would check current sprint capacity and auto-assign high-priority objectives

        return new Response(JSON.stringify({ 
            success: true, 
            objective: objective,
            wsjf_score: wsjfScore,
            message: 'Objective created successfully.' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in createHuddleObjective function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});