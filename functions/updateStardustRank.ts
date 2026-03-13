
import { createClient } from 'npm:@base44/sdk@0.1.0';

/**
 * This function calculates a user's Stardust rank, division, and endorsement power
 * based on their total stardust points. It is called after a user earns stardust.
 */
const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

function getStardustRank(stardustPoints) {
    const tiers = [
        { name: "Hangar Cadet", divisions: [0, 50, 100, 150] },
        { name: "Runway Rookie", divisions: [150, 200, 250, 300] },
        { name: "Taxiway Pilot", divisions: [300, 400, 500, 600] },
        { name: "Flight Officer", divisions: [600, 800, 1000, 1200] },
        { name: "Sky Captain", divisions: [1200, 1500, 1800, 2000] },
        { name: "Stratos Commander", divisions: [2000, 2400, 2800, 3000] },
        { name: "Orbital Ace", divisions: [3000, 3500, 4000, 4500] },
        { name: "Zero-Gravity Icon", divisions: [4500] }
    ];

    for (let i = tiers.length - 1; i >= 0; i--) {
        for (let d = tiers[i].divisions.length - 1; d >= 0; d--) {
            if (stardustPoints >= tiers[i].divisions[d]) {
                return {
                    tier: tiers[i].name,
                    division: d > 0 && tiers[i].name !== "Zero-Gravity Icon" ? `Div ${['I', 'II', 'III'][d-1]}` : null,
                    multiplier: calculateMultiplier(tiers[i].name, d)
                };
            }
        }
    }
    
    // Fallback (should never reach here with valid input)
    return {
        tier: "Hangar Cadet",
        division: null,
        multiplier: 1.0
    };
}

function calculateMultiplier(tierName, divisionIndex) {
    // Calculate multiplier based on tier and division
    // Higher tiers and divisions get higher multipliers
    const tierMultipliers = {
        "Hangar Cadet": 1.0,
        "Runway Rookie": 1.1,
        "Taxiway Pilot": 1.2,
        "Flight Officer": 1.4,
        "Sky Captain": 1.6,
        "Stratos Commander": 1.9,
        "Orbital Ace": 2.3,
        "Zero-Gravity Icon": 3.0
    };
    
    const baseMultiplier = tierMultipliers[tierName] || 1.0;
    
    // Add division bonus (higher divisions get slight bonus)
    const divisionBonus = divisionIndex > 0 ? (divisionIndex * 0.05) : 0;
    
    return parseFloat((baseMultiplier + divisionBonus).toFixed(2));
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response('Unauthorized', { status: 401, headers: corsHeaders });
        }
        const token = authHeader.split(' ')[1];
        base44.auth.setToken(token);

        const { user_email, stardust_points } = await req.json();
        
        if (!user_email || stardust_points === undefined) {
            return new Response(JSON.stringify({ 
                error: 'user_email and stardust_points are required' 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Calculate new rank and multiplier
        const rankInfo = getStardustRank(stardust_points);
        
        // Update user with new rank information
        const updateData = {
            stardust_rank_name: rankInfo.tier,
            stardust_division_name: rankInfo.division,
            endorsement_power: rankInfo.multiplier,
        };

        // Find user and update
        const users = await base44.entities.User.filter({ email: user_email });
        if (users.length === 0) {
            return new Response(JSON.stringify({ 
                error: 'User not found' 
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        await base44.entities.User.update(users[0].id, updateData);

        return new Response(JSON.stringify({
            success: true,
            message: 'Stardust rank updated successfully',
            rank_info: rankInfo,
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error updating Stardust rank:', error);
        return new Response(JSON.stringify({ 
            error: `Failed to update Stardust rank: ${error.message}` 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
