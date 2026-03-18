
import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// Habit Orchestration Service - Core scoring logic
const HABIT_REWARDS = {
    WATER: { stardust: 1, clout: 0.5, momentum: 0.1 },
    RBT: { stardust: 2, clout: 1, momentum: 0.2 },
    BALLOT: { stardust: 0.5, clout: 1, momentum: 0.05 },
    SIDEQUEST: { stardust: 0, clout: 0, momentum: 0 }
};

const STREAK_BONUS_THRESHOLD = 7;
const STREAK_MULTIPLIER = 0.1;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const body = await req.json();
        const { habit_type, quantity = 1, metadata = {}, idempotency_key } = body;
        
        if (!habit_type || !HABIT_REWARDS[habit_type]) {
            return new Response(JSON.stringify({ error: 'Invalid habit type' }), { 
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const now = new Date().toISOString();
        const today = now.split('T')[0];
        
        // Create HabitLog
        const habitLog = await base44.entities.HabitLog.create({
            user_id: user.id,
            habit_type,
            occurred_at: now,
            quantity,
            metadata,
            idempotency_key,
            source: 'web'
        });

        // Update Streak
        const existingStreaks = await base44.entities.Streak.filter({ 
            user_id: user.id, 
            habit_type 
        });
        
        let currentStreak, newCurrent, newBest;
        
        if (existingStreaks.length === 0) {
            currentStreak = await base44.entities.Streak.create({
                user_id: user.id,
                habit_type,
                current: 1,
                best: 1,
                last_completed_date: today
            });
            newCurrent = 1;
            newBest = 1;
        } else {
            currentStreak = existingStreaks[0];
            const lastDate = currentStreak.last_completed_date ? new Date(currentStreak.last_completed_date) : null;
            const todayDate = new Date(today);
            const diffDays = lastDate ? Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24)) : Infinity;
            
            if (diffDays === 0) { // Same day, no change to streak
                newCurrent = currentStreak.current || 1;
                newBest = currentStreak.best || 1;
            } else if (diffDays === 1) { // Consecutive day
                newCurrent = (currentStreak.current || 0) + 1;
                newBest = Math.max(currentStreak.best || 0, newCurrent);
            } else { // Streak broken
                newCurrent = 1;
                newBest = currentStreak.best || 1;
            }
            
            // Only update if it's a new day
            if (diffDays >= 1) {
                await base44.entities.Streak.update(currentStreak.id, {
                    current: newCurrent,
                    best: newBest,
                    last_completed_date: today
                });
            }
        }

        // Calculate Rewards
        const baseReward = HABIT_REWARDS[habit_type];
        let streakMultiplier = 1;
        
        if (newCurrent >= STREAK_BONUS_THRESHOLD) {
            const streakBonuses = Math.floor(newCurrent / STREAK_BONUS_THRESHOLD);
            streakMultiplier = 1 + (streakBonuses * STREAK_MULTIPLIER);
        }
        
        const finalStardust = Math.round(baseReward.stardust * streakMultiplier);
        const finalClout = Math.round(baseReward.clout * streakMultiplier * 10) / 10;

        // Create RewardGrant
        const rewardGrant = await base44.entities.RewardGrant.create({
            user_id: user.id,
            stardust: finalStardust,
            clout: finalClout,
            starpower_delta: 0,
            reason_code: habit_type,
            source_event_id: habitLog.id,
            idempotency_key,
            granted_at: now
        });
        
        // **REMOVED** the heavy `updateUserScores` call to prevent rate limiting.
        // Instead, perform a lightweight update of the user's points directly.
        const currentStardust = user.stardust_points || 0;
        const currentClout = user.clout || 0;
        
        await base44.entities.User.update(user.id, {
            stardust_points: currentStardust + finalStardust,
            clout: currentClout + finalClout,
            last_stardust_activity: new Date().toISOString()
        });

        // Also trigger the lightweight rank update.
        try {
            await base44.functions.invoke('updateStardustRank', {
                user_email: user.email
            });
        } catch (e) {
            console.error("Could not trigger rank update", e.message);
        }

        return new Response(JSON.stringify({
            success: true,
            message: `${habit_type} habit completed successfully`,
            data: {
                habit_log_id: habitLog.id,
                streak: {
                    current: newCurrent,
                    best: newBest,
                    bonus_multiplier: streakMultiplier
                },
                rewards: {
                    stardust: finalStardust,
                    clout: finalClout,
                    momentum: baseReward.momentum
                },
                reward_grant_id: rewardGrant.id
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Habit Orchestration Service error:', error);
        return new Response(JSON.stringify({ 
            error: 'Internal server error',
            details: error.message 
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
