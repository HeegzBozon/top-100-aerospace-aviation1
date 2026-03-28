import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { agentName, harnessId, skillIds } = await req.json();
    if (!agentName) {
      return Response.json({ error: 'Missing agentName' }, { status: 400 });
    }

    // Find existing linkage or create new one
    const existing = await base44.entities.AgentLinkage.filter({ agent_name: agentName });
    
    const linkageData = {
      agent_name: agentName,
      linked_harness_id: harnessId || null,
      linked_skill_ids: skillIds || [],
    };

    let result;
    if (existing.length > 0) {
      // Update existing
      result = await base44.asServiceRole.entities.AgentLinkage.update(existing[0].id, linkageData);
    } else {
      // Create new
      result = await base44.asServiceRole.entities.AgentLinkage.create(linkageData);
    }

    console.log(`Linked ${agentName} to harness ${harnessId} and skills:`, skillIds);

    return Response.json({
      success: true,
      message: `Agent ${agentName} linkages saved`,
      metadata: linkageData,
    });
  } catch (error) {
    console.error('Link harness error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});