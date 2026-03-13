import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return new Response(JSON.stringify({ success: false, error: 'Admin access required' }), { 
                status: 403, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const { season_id, dataType } = await req.json();
        if (!season_id || !dataType) {
            return new Response(JSON.stringify({ success: false, error: 'season_id and dataType are required' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const service = base44.asServiceRole;
        const rankedVotes = await service.entities.RankedVote.filter({ season_id }, '-created_date');
        let data;

        if (dataType === 'voters') {
            const voterEmails = [...new Set(rankedVotes.map(v => v.voter_email))];
            if (voterEmails.length > 0) {
                const users = await service.entities.User.filter({ email: { $in: voterEmails } });
                data = users.map(u => ({ email: u.email, fullName: u.full_name, joined: u.created_date }));
            } else {
                data = [];
            }
        } else if (dataType === 'ballots') {
            const allNomineeIds = [...new Set(rankedVotes.flatMap(v => v.ballot || []))];
            let nomineeMap = new Map();
            if (allNomineeIds.length > 0) {
                 const nominees = await service.entities.Nominee.filter({ id: { $in: allNomineeIds } });
                 nomineeMap = new Map(nominees.map(n => [n.id, n.name]));
            }
           
            data = rankedVotes.map(v => ({
                id: v.id,
                voter_email: v.voter_email,
                created_date: v.created_date,
                ballot: (v.ballot || []).map(id => nomineeMap.get(id) || `[Unknown ID: ${id}]`).join(', ')
            }));
        } else {
            return new Response(JSON.stringify({ success: false, error: 'Invalid dataType specified' }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        return new Response(JSON.stringify({ success: true, data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get Raw RCV Data error:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});