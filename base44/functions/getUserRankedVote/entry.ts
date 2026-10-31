import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { seedBallotForVoter } from '../../shared/ballotSeed.ts';

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

        const saved = existingVote.length > 0 ? (existingVote[0].ballot || []) : [];

        // A ballot opens where the Fellow's own nominations left it: the people they put
        // forward are the draft it starts from. Seeded is not cast — has_voted only turns
        // true once they save the ballot themselves.
        const seeded = saved.length
            ? { ids: [], count: 0 }
            : await seedBallotForVoter(base44.asServiceRole, { email: user.email, seasonId: season_id })
                .catch(() => ({ ids: [], count: 0 }));

        const ballot = saved.length ? saved : seeded.ids || [];

        return new Response(JSON.stringify({ 
            success: true, 
            ballot,
            has_voted: saved.length > 0,
            seeded: saved.length === 0 && ballot.length > 0,
            seeded_count: seeded.count || 0
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