import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const serviceRole = base44.asServiceRole;

  try {
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403, headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { season_id } = await req.json();
    if (!season_id) {
        return new Response(JSON.stringify({ error: 'Season ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const nominees = await serviceRole.entities.Nominee.filter({ season_id, status: 'active' });
    const count = nominees ? nominees.length : 0;
    
    return new Response(JSON.stringify({ count }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('Error in getNomineeCountForSeason:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to get nominee count', 
      details: error.message 
    }), {
      status: 500, 
      headers: { 'Content-Type': 'application/json' }
    });
  }
});