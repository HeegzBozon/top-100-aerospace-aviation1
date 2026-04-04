import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { email, source } = body;
    
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Save to entity using service role (so public users can submit)
    await base44.asServiceRole.entities.LiveStreamLead.create({ email, source });
    
    // Simulate HubSpot POST
    console.log(`[HubSpot Mock POST] Lead captured: ${email} from source: ${source}`);
    
    return Response.json({ success: true, message: 'Lead captured and mock HubSpot POST executed' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});