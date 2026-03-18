import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized', not_connected: true }, { status: 401 });
    }
  } catch (authError) {
    console.error('Auth error:', authError);
    return Response.json({ error: 'Unauthorized', not_connected: true }, { status: 401 });
  }

  try {
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("tiktok");
    
    if (!accessToken) {
      return Response.json({ connected: false, not_connected: true, message: 'TikTok not authorized' });
    }

    return Response.json({ 
      connected: true,
      message: 'TikTok connected for video sharing'
    });
  } catch (tokenError) {
    console.error('TikTok token error:', tokenError);
    // Return success-like response with connected: false instead of error
    return Response.json({ connected: false, not_connected: true, message: 'TikTok not authorized yet' });
  }
});