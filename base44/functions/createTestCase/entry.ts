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

        const { testCaseData } = await req.json();

        if (!testCaseData || !testCaseData.feedback_id || !testCaseData.title) {
            return new Response(JSON.stringify({ error: 'Missing required test case data' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const payload = {
            ...testCaseData,
            created_by: user.email
        };

        const testCase = await base44.entities.TestCase.create(payload);

        return new Response(JSON.stringify({ 
            success: true, 
            test_case: testCase 
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in createTestCase function:', error.message);
        return new Response(JSON.stringify({ 
            error: 'Failed to create test case',
            details: error.message 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});