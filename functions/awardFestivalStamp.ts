import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    const { stamp_type, stamp_name, description, season_id, metadata } = await req.json();
    
    if (!stamp_type || !stamp_name || !season_id) {
      return new Response(JSON.stringify({ 
        error: 'stamp_type, stamp_name, and season_id are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user already has this stamp for this season
    const existingStamps = await base44.entities.FestivalStamp.filter({
      user_email: user.email,
      stamp_type: stamp_type,
      season_id: season_id
    });

    if (existingStamps.length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Stamp already earned for this season'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create the festival stamp
    const stamp = await base44.entities.FestivalStamp.create({
      user_email: user.email,
      stamp_type: stamp_type,
      stamp_name: stamp_name,
      description: description || `Earned ${stamp_name}`,
      season_id: season_id,
      earned_date: new Date().toISOString(),
      badge_icon: stamp_type,
      metadata: metadata || {}
    });

    return new Response(JSON.stringify({
      success: true,
      message: `Festival stamp "${stamp_name}" awarded!`,
      stamp: stamp
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error awarding festival stamp:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});