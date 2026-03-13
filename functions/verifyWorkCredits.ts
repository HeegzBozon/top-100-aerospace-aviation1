import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { creditIds = [], councilId = null } = await req.json();
    const updates = [];
    const errors = [];

    // If no IDs provided, process unverified credits
    let credits = creditIds.length > 0
      ? await Promise.all(creditIds.map(id => base44.asServiceRole.entities.WorkCredit.read(id)))
      : await base44.asServiceRole.entities.WorkCredit.filter(
          { verification_status: 'unverified' },
          '-created_date',
          500
        );

    for (const credit of credits) {
      if (!credit) continue;

      try {
        // Fetch associated work, nominee, and organization for verification
        const work = await base44.asServiceRole.entities.Work.read(credit.work_id);
        const nominee = await base44.asServiceRole.entities.Nominee.read(credit.nominee_id);
        const org = credit.organization_id 
          ? await base44.asServiceRole.entities.Organization.read(credit.organization_id)
          : null;

        if (!work || !nominee) {
          errors.push({ creditId: credit.id, error: 'Missing work or nominee' });
          continue;
        }

        // Verification logic:
        // 1. If work has external_id and data_source is trusted (OpenAlex, USPTO), high confidence
        // 2. If nominee has verified LinkedIn profile, boost confidence
        // 3. If organization verified, boost confidence further
        let newStatus = 'ai_inferred';
        let confidenceScore = 0.6;

        // Trusted data source + external ID = organization_verified equivalent
        if (work.external_id && ['OpenAlex', 'USPTO PatentsView'].includes(work.data_source)) {
          confidenceScore = 0.85;
        }

        // If nominee profile is verified, increase confidence
        if (nominee.verified_status === 'fully_verified' || nominee.verified_status === 'partially_verified') {
          confidenceScore = Math.min(confidenceScore + 0.1, 0.95);
        }

        // If organization verified, increase confidence
        if (org?.verified_status === 'verified') {
          confidenceScore = Math.min(confidenceScore + 0.05, 1.0);
        }

        // If council ID provided and confidence high enough, mark as council_verified
        if (councilId && confidenceScore >= 0.8) {
          newStatus = 'council_verified';
        } else if (confidenceScore >= 0.85) {
          newStatus = 'organization_verified';
        }

        // Update credit with verification status
        const updatedCredit = await base44.asServiceRole.entities.WorkCredit.update(credit.id, {
          verification_status: newStatus,
          confidence_score: confidenceScore,
          verified_by_council_id: councilId && newStatus === 'council_verified' ? councilId : null
        });

        updates.push({
          credit_id: credit.id,
          work_title: work.title,
          nominee_name: nominee.name,
          old_status: credit.verification_status,
          new_status: newStatus,
          confidence_score: confidenceScore
        });
      } catch (err) {
        errors.push({ creditId: credit.id, error: err.message });
      }
    }

    base44.analytics.track({
      eventName: 'work_credits_verified',
      properties: { credits_verified: updates.length, errors: errors.length }
    });

    return Response.json({
      credits_verified: updates.length,
      updates,
      errors
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});