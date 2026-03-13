import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

// A simple map for stardust rewards.
const REWARD_MAP = {
  'vote': { stardust: 10 },
  'tip_share': { stardust: 50 },
  'nomination_submitted': { stardust: 100 },
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  if (!(await base44.auth.isAuthenticated())) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const { action_type } = await req.json();

    if (!action_type) {
      return new Response(JSON.stringify({ error: 'Missing required parameter: action_type.' }), { status: 400 });
    }

    const reward = REWARD_MAP[action_type];
    if (!reward) {
      return new Response(JSON.stringify({ success: true, message: 'No reward configured for this action.' }), { status: 200 });
    }

    const { stardust } = reward;
    const newStardust = (user.stardust_points || 0) + stardust;

    // Use Promise.all to perform updates concurrently for better performance.
    await Promise.all([
      // 1. Create the RewardGrant record to log the transaction.
      base44.asServiceRole.entities.RewardGrant.create({
        user_id: user.id,
        reason_code: 'VOTE', // Standardize on 'VOTE'
        stardust: stardust,
        granted_at: new Date().toISOString(),
      }),
      // 2. Update the user's total score and last activity timestamp.
      base44.asServiceRole.entities.User.update(user.id, { 
        stardust_points: newStardust,
        last_stardust_activity: new Date().toISOString()
      })
    ]);

    return new Response(JSON.stringify({ 
      success: true, 
      stardust_awarded: stardust,
      new_total: newStardust
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in awardStardust function:', error);
    return new Response(JSON.stringify({ error: 'An internal server error occurred.', details: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
});