import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        
        const user = await base44.auth.me();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { sessionId, updateData } = await req.json();

        if (!sessionId || !updateData) {
            return new Response(JSON.stringify({ error: 'Missing required update data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const updatedSession = await base44.entities.TestSession.update(sessionId, updateData);

        return new Response(JSON.stringify({ 
            success: true, 
            test_session: updatedSession 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error updating test session:', error.message);
        return new Response(JSON.stringify({ 
            error: 'Failed to update test session',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});