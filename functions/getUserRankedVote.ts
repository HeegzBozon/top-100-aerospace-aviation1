import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), { 
                status: 401, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        const { season_id } = await req.json();
        
        if (!season_id) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'season_id is required' 
            }), { 
                status: 400, 
                headers: { 'Content-Type': 'application/json' } 
            });
        }

        // Get user's existing ranked vote for this season
        const existingVote = await base44.entities.RankedVote.filter({ 
            season_id, 
            voter_email: user.email 
        });

        const ballot = existingVote.length > 0 ? existingVote[0].ballot : [];

        return new Response(JSON.stringify({ 
            success: true, 
            ballot,
            has_voted: ballot.length > 0
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get user ranked vote error:', error);
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message 
        }), { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }
});