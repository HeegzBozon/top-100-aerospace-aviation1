import { createClient } from 'npm:@base44/sdk@0.1.0';

const base44 = createClient({
    appId: Deno.env.get('BASE44_APP_ID'),
});

// Scoring Configuration - Sprint 2 Enhanced
const SCORING_CONFIG = {
    // Starpower Components
    STARPOWER: {
        PAIRWISE_WEIGHT: 0.45,
        RANKED_CHOICE_WEIGHT: 0.35,
        DIRECT_VOTE_WEIGHT: 0.20
    },
    
    // Efficiency Curves
    STARDUST_EFFICIENCY: {
        SCALE: 500,
        MAX_EFFECTIVE: 100
    },
    
    CLOUT_EFFICIENCY: {
        SCALE: 300,
        MAX_EFFECTIVE: 100
    },
    
    // Aura Composition
    AURA_WEIGHTS: {
        STARPOWER: 0.60,
        STARDUST: 0.20,
        CLOUT: 0.20
    },
    
    // Momentum Factor - NEW in Sprint 2
    MOMENTUM: {
        MAX_BOOST: 0.10, // ±10% cap
        DECAY_RATE: 0.02, // 2% per day
        ACTIVITY_THRESHOLD: 3, // Actions needed for momentum
        LOOKBACK_DAYS: 7
    },
    
    // Freshness Decay - NEW in Sprint 2
    FRESHNESS: {
        HALF_LIFE_DAYS: 30,
        MIN_RETENTION: 0.5 // 50% minimum retention
    }
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Calculate momentum factor based on recent activity
function calculateMomentumFactor(recentActivities) {
    const activityCount = recentActivities.length;
    
    if (activityCount < SCORING_CONFIG.MOMENTUM.ACTIVITY_THRESHOLD) {
        return 0; // No momentum boost
    }
    
    // Linear boost based on activity frequency
    const baseBoost = Math.min(
        activityCount / (SCORING_CONFIG.MOMENTUM.ACTIVITY_THRESHOLD * 2),
        1.0
    );
    
    // Check for streaks and consistency
    const now = new Date();
    const recentDays = new Set();
    
    recentActivities.forEach(activity => {
        const activityDate = new Date(activity.created_date);
        const daysDiff = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));
        recentDays.add(daysDiff);
    });
    
    const consistencyBonus = recentDays.size >= 3 ? 0.2 : 0; // 20% bonus for 3+ active days
    
    return Math.min(
        (baseBoost + consistencyBonus) * SCORING_CONFIG.MOMENTUM.MAX_BOOST,
        SCORING_CONFIG.MOMENTUM.MAX_BOOST
    );
}

// Calculate freshness decay based on last activity
function calculateFreshnessFactor(lastActivityDate) {
    if (!lastActivityDate) return SCORING_CONFIG.FRESHNESS.MIN_RETENTION;
    
    const now = new Date();
    const lastActivity = new Date(lastActivityDate);
    const daysSinceActivity = (now - lastActivity) / (1000 * 60 * 60 * 24);
    
    // Exponential decay with half-life
    const decayFactor = Math.pow(0.5, daysSinceActivity / SCORING_CONFIG.FRESHNESS.HALF_LIFE_DAYS);
    
    return Math.max(decayFactor, SCORING_CONFIG.FRESHNESS.MIN_RETENTION);
}

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

        const { user_email } = await req.json();
        
        if (!user_email) {
            return new Response(JSON.stringify({ 
                error: 'user_email is required' 
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Find the user
        const users = await base44.entities.User.filter({ email: user_email });
        if (users.length === 0) {
            return new Response(JSON.stringify({ 
                error: 'User not found' 
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const user = users[0];
        const currentStardust = user.stardust_points || 0;
        const currentClout = user.clout || 0;
        const currentStarPower = user.star_power || 0;

        // Calculate Stardust Efficiency (diminishing returns)
        const stardustEfficiency = SCORING_CONFIG.STARDUST_EFFICIENCY.MAX_EFFECTIVE * 
            (1 - Math.exp(-currentStardust / SCORING_CONFIG.STARDUST_EFFICIENCY.SCALE));

        // Calculate Clout Efficiency (logarithmic scaling)
        const cloutEfficiency = currentClout > 0 ? 
            SCORING_CONFIG.CLOUT_EFFICIENCY.MAX_EFFECTIVE * 
            Math.log1p(currentClout) / Math.log1p(SCORING_CONFIG.CLOUT_EFFICIENCY.SCALE) : 0;

        // Get recent activities for momentum calculation
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - SCORING_CONFIG.MOMENTUM.LOOKBACK_DAYS);
        
        const recentActivities = await base44.entities.RewardGrant.filter({
            user_id: user.id,
            granted_at: { $gte: weekAgo.toISOString() }
        });

        // Calculate momentum factor
        const momentumFactor = calculateMomentumFactor(recentActivities);

        // Calculate freshness factor
        const lastActivityDate = user.last_stardust_activity || user.created_date;
        const freshnessFactor = calculateFreshnessFactor(lastActivityDate);

        // Calculate base Aura score
        const baseAura = (
            SCORING_CONFIG.AURA_WEIGHTS.STARPOWER * currentStarPower +
            SCORING_CONFIG.AURA_WEIGHTS.STARDUST * stardustEfficiency +
            SCORING_CONFIG.AURA_WEIGHTS.CLOUT * cloutEfficiency
        );

        // Apply momentum boost and freshness decay
        const momentumAdjustment = baseAura * momentumFactor;
        const finalAura = (baseAura + momentumAdjustment) * freshnessFactor;

        // Update user with new scores
        const updateData = {
            aura_score: Math.round(finalAura * 100) / 100,
            last_stardust_activity: new Date().toISOString()
        };

        await base44.entities.User.update(user.id, updateData);

        return new Response(JSON.stringify({
            success: true,
            message: 'User scores updated successfully',
            scores: {
                aura: finalAura,
                starpower: currentStarPower,
                stardust_eff: stardustEfficiency,
                clout_eff: cloutEfficiency,
                momentum_factor: momentumFactor,
                freshness_factor: freshnessFactor,
                momentum_adjustment: momentumAdjustment
            },
            breakdown: {
                base_aura: baseAura,
                momentum_boost: momentumAdjustment,
                final_aura: finalAura,
                recent_activities: recentActivities.length
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error updating user scores:', error);
        return new Response(JSON.stringify({ 
            error: `Failed to update user scores: ${error.message}` 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});