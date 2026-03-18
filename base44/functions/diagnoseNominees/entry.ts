import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        // Auth check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
        }

        const { season_id } = await req.json();
        if (!season_id) {
            return new Response(JSON.stringify({ error: 'season_id is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        // Get all nominees
        const allNominees = await base44.entities.Nominee.filter({ season_id });

        // Status breakdown
        const statusBreakdown = allNominees.reduce((acc, nominee) => {
            const status = nominee.status || 'no_status';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Find duplicates
        const nameMap = new Map();
        const emailMap = new Map();
        
        allNominees.forEach(nominee => {
            const name = nominee.name?.toLowerCase().trim();
            const email = nominee.nominee_email?.toLowerCase().trim();

            if (name) {
                const existing = nameMap.get(name) || [];
                nameMap.set(name, [...existing, nominee]);
            }
            if (email) {
                const existing = emailMap.get(email) || [];
                emailMap.set(email, [...existing, nominee]);
            }
        });

        const duplicatesByName = Array.from(nameMap.values())
            .filter(group => group.length > 1)
            .map(group => ({
                name: group[0].name,
                count: group.length,
                ids: group.map(n => n.id)
            }));

        const duplicatesByEmail = Array.from(emailMap.values())
            .filter(group => group.length > 1)
            .map(group => ({
                email: group[0].nominee_email,
                count: group.length,
                ids: group.map(n => n.id)
            }));
            
        // Find missing emails
        const missingEmails = allNominees.filter(n => !n.nominee_email).length;

        const responsePayload = {
            total_nominees: allNominees.length,
            status_breakdown: statusBreakdown,
            duplicatesByName,
            duplicatesByEmail,
            missing_emails: missingEmails,
        };
        
        return new Response(JSON.stringify(responsePayload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Diagnostic function error:', error);
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});