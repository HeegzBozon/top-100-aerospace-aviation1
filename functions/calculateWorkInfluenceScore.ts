import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { workIds = [] } = await req.json();
    const updates = [];

    // If no IDs provided, process all works
    const works = workIds.length > 0
      ? await Promise.all(workIds.map(id => base44.asServiceRole.entities.Work.read(id)))
      : await base44.asServiceRole.entities.Work.list('-created_date', 1000);

    for (const work of works) {
      if (!work) continue;

      // Get all credits for this work
      const credits = await base44.asServiceRole.entities.WorkCredit.filter(
        { work_id: work.id },
        '',
        1000
      );

      // Calculate influence score: (citations * 2) + (media_mentions * 3) + (community_votes * 1)
      const citationWeight = 2;
      const mediaWeight = 3;
      const voteWeight = 1;

      const influenceScore = 
        (work.citation_count || 0) * citationWeight +
        (work.media_mention_count || 0) * mediaWeight +
        (work.community_votes || 0) * voteWeight;

      // Update work with influence score
      const updatedWork = await base44.asServiceRole.entities.Work.update(work.id, {
        influence_score: influenceScore
      });

      updates.push({
        work_id: work.id,
        title: work.title,
        influence_score: influenceScore,
        citations: work.citation_count || 0,
        mentions: work.media_mention_count || 0,
        votes: work.community_votes || 0,
        credits_count: credits.length
      });
    }

    base44.analytics.track({
      eventName: 'work_influence_score_calculated',
      properties: { works_updated: updates.length }
    });

    return Response.json({
      works_updated: updates.length,
      updates
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});