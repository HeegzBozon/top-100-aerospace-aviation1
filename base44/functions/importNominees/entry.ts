import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), { status: 401 });
        }
        
        base44.auth.setToken(authHeader.split(' ')[1]);
        
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), { status: 403 });
        }

        const { records } = await req.json();
        let imported = 0;
        let errors = [];

        for (const record of records) {
            try {
                await base44.entities.Nominee.create({
                    name: record.name || 'Unnamed Nominee',
                    description: record.nomination_reason || record.bio || `Imported nominee`,
                    nominated_by: 'admin@import.com',
                    nominee_email: record.email || '',
                    status: 'active',
                    season_id: '689af2bb66e1db97dcb454f9', // Default season ID
                    title: record.title || '',
                    company: record.organization || '',
                    avatar_url: record.photo_url || ''
                });
                imported++;
            } catch (e) {
                errors.push({ recordName: record.name, error: e.message });
            }
        }

        return new Response(JSON.stringify({
            success: true,
            imported,
            errors: errors.length,
            errorDetails: errors,
        }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }
});