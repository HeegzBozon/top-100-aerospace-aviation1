
import { createClient } from 'npm:@base44/sdk@0.1.0';
import { startOfDay, subDays } from 'npm:date-fns@3.6.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Authenticate user first
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(JSON.stringify({ error: 'Unauthorized - missing auth header' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            return new Response(JSON.stringify({ error: 'Unauthorized - invalid auth format' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        base44.auth.setToken(token);
        
        try {
            await base44.auth.me();
        } catch (authError) {
            return new Response(JSON.stringify({ error: 'Unauthorized - invalid token' }), {
                status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const { id: nomineeId } = await req.json();
        
        if (!nomineeId) {
            return new Response(JSON.stringify({ error: 'nominee id is required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const [nominee] = await base44.entities.Nominee.filter({ id: nomineeId });
        if (!nominee) {
            return new Response(JSON.stringify({ error: 'Nominee not found' }), {
                status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Fetch recent standings data for this specific nominee
        const today = startOfDay(new Date());
        const yesterday = startOfDay(subDays(today, 1));
        
        const [todayStanding, yesterdayStanding] = await Promise.all([
             base44.entities.Standing.filter({ nominee_id: nomineeId, date: today.toISOString().split('T')[0] }),
             base44.entities.Standing.filter({ nominee_id: nomineeId, date: yesterday.toISOString().split('T')[0] })
        ]);

        const currentRank = todayStanding[0]?.rank;
        const delta24h = (yesterdayStanding[0]?.rank && currentRank) ? yesterdayStanding[0].rank - currentRank : null;

        const responseData = {
            id: nominee.id,
            name: nominee.name,
            title: nominee.title,
            company: nominee.company,
            avatarUrl: nominee.avatar_url,
            bio: nominee.bio,
            currentRank,
            delta24h,
            starpower: nominee.starpower_score,
            borda: nominee.borda_score,
            elo: nominee.elo_rating
        };

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
