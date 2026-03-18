import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders });
        }

        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        const user = await base44.auth.me();

        if (!user) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders });
        }

        const body = await req.json();
        const { action, data } = body;

        let result = {};
        switch (action) {
            case 'claim_credit':
                result = await claimCredit(user, data);
                break;
            case 'verify_credit':
                if (user.role !== 'admin') throw new Error('Forbidden');
                result = await verifyCredit(data.credit_id);
                break;
            case 'list_programs':
                result = await base44.entities.AerospaceProgram.list();
                break;
            default:
                throw new Error('Invalid action');
        }

        return Response.json({ success: true, ...result }, { headers: corsHeaders });

    } catch (error) {
        console.error('Program service error:', error);
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
});

async function claimCredit(user, data) {
    const { program_id, role, year, evidence_url } = data;

    if (!program_id || !role || !year) {
        throw new Error('Missing required fields</h4>');
    }

    const credit = await base44.entities.ProgramCredit.create({
        user_id: user.id,
        user_email: user.email,
        program_id,
        role,
        year,
        evidence_url,
        status: 'pending',
        verified_at: null
    });

    return { credit };
}

async function verifyCredit(creditId) {
    const updated = await base44.entities.ProgramCredit.update(creditId, {
        status: 'verified',
        verified_at: new Date().toISOString()
    });

    return { updated };
}
