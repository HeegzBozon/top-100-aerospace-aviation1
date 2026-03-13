import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), { status: 401 });
    }

    const { nominee_id } = await req.json();
    if (!nominee_id) {
      return new Response(JSON.stringify({ success: false, error: 'Nominee ID is required' }), { status: 400 });
    }

    const nominee = await base44.entities.Nominee.get(nominee_id);
    if (!nominee) {
      return new Response(JSON.stringify({ success: false, error: 'Nominee not found' }), { status: 404 });
    }

    if (nominee.nominee_email !== user.email) {
      return new Response(JSON.stringify({ success: false, error: 'Email verification failed.' }), { status: 403 });
    }

    if (nominee.claimed_by_user_email) {
      return new Response(JSON.stringify({ success: false, error: 'This profile has already been claimed.' }), { status: 409 });
    }

    if (nominee.claim_status === 'pending') {
      return new Response(JSON.stringify({ success: false, error: 'Your claim request is pending admin approval.' }), { status: 409 });
    }

    await base44.entities.Nominee.update(nominee_id, {
      claim_status: 'pending',
      claim_requested_by: user.email,
      claim_requested_date: new Date().toISOString()
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Claim request submitted! An admin will review your request shortly.',
      nominee: { ...nominee, claim_status: 'pending', claim_requested_by: user.email }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error in claimNomineeProfile: ${error.message}`);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error.message 
    }), { status: 500 });
  }
});