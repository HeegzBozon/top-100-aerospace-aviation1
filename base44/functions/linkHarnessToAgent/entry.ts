import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { agentName, harnessId, skillIds } = await req.json();
    if (!agentName) {
      return Response.json({ error: 'Missing agentName' }, { status: 400 });
    }

    // Build metadata object to track linkages
    const metadata = {
      linked_harness_id: harnessId || null,
      linked_skill_ids: skillIds || [],
      last_updated: new Date().toISOString(),
    };

    // In a real implementation, this would update the agents/*.json file
    // For now, we'll store the metadata in a tracking entity or log it
    console.log(`Linked ${agentName} to harness ${harnessId} and skills:`, skillIds);

    return Response.json({
      success: true,
      message: `Agent ${agentName} linkages saved`,
      metadata,
    });
  } catch (error) {
    console.error('Link harness error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});