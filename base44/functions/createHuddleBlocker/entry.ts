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
            desc,
            severity = 'medium',
            wsjf_fields = { bv: 3, tc: 7, rr: 3, size: 5 },
            eisenhower = { urgent: true, important: false },
            due_ts,
            ticket_ref
        } = await req.json();

        if (!session_id || !title || !desc) {
            return new Response(JSON.stringify({ error: 'session_id, title, and desc are required.' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        if (!['low', 'medium', 'high', 'critical'].includes(severity)) {
            return new Response(JSON.stringify({ error: 'Invalid severity. Must be low, medium, high, or critical.' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const blocker = await base44.entities.Blocker.create({
            session_id: session_id,
            title: title,
            desc: desc,
            severity: severity,
            owner_email: user.email,
            wsjf_fields: wsjf_fields,
            eisenhower: eisenhower,
            due_ts: due_ts,
            ticket_ref: ticket_ref,
            status: 'open'
        });

        // TODO: Phase 2 - Auto-schedule to sprint if team capacity < 80%
        // This would check current team capacity and automatically create tickets for high-severity blockers

        return new Response(JSON.stringify({ 
            success: true, 
            blocker: blocker,
            message: 'Blocker created successfully.' 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in createHuddleBlocker function:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});