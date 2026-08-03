import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { grantStardust } from '../../shared/stardust.ts';

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

    const result = await grantStardust(base44.asServiceRole, {
      user_id: user.id,
      action_type,
      multiplier: 1
    });

    return new Response(JSON.stringify({
      success: true,
      stardust_awarded: result.points_awarded,
      new_total: result.new_total,
      message: result.message,
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