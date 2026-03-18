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

        const { sessionData } = await req.json();

        if (!sessionData || !sessionData.test_case_id || !sessionData.feedback_id) {
            return new Response(JSON.stringify({ error: 'Missing required session data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get the test case to include its steps in the session
        const testCase = await base44.entities.TestCase.get(sessionData.test_case_id);
        if (!testCase) {
            return new Response(JSON.stringify({ error: 'Test case not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const testSession = await base44.entities.TestSession.create({
            ...sessionData,
            test_steps: testCase.test_steps // Include steps for easier access
        });

        return new Response(JSON.stringify({ 
            success: true, 
            test_session: testSession 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error starting test session:', error.message);
        return new Response(JSON.stringify({ 
            error: 'Failed to start test session',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});