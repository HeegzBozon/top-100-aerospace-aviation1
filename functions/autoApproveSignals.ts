import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Auto-approve low-confidence signals based on scoring heuristics
 * Admin-only function
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Fetch C-confidence mentions
    const mentions = await base44.entities.HonoreeMention.filter(
      { confidence: 'C' },
      '-created_date',
      500
    );

    if (!mentions || mentions.length === 0) {
      return Response.json({
        status: 'success',
        processed: 0,
        promoted: 0,
        rejected: 0,
      });
    }

    // Scoring function
    const scoreConfidence = (mention) => {
      let score = 0;

      // Name match strength
      if (mention.article_title?.includes(mention.nominee_name)) {
        score += 25;
      }
      if (mention.article_summary?.includes(mention.nominee_name)) {
        score += 15;
      }

      // Multiple mentions in same article
      const titleCount = (mention.article_title?.match(new RegExp(mention.nominee_name, 'gi')) || []).length;
      score += Math.min(titleCount * 5, 20);

      // Recency boost
      const daysSince = Math.max(
        0,
        (Date.now() - new Date(mention.scanned_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 1) score += 15;
      else if (daysSince < 7) score += 10;

      // Source credibility (heuristic)
      const credibleSources = ['NASA', 'SpaceX', 'Blue Origin', 'ESA', 'MIT', 'Stanford'];
      if (credibleSources.some(src => mention.news_site?.includes(src))) {
        score += 20;
      }

      return score;
    };

    // Process mentions
    const promoted = [];
    const rejected = [];

    for (const mention of mentions) {
      const confidence = scoreConfidence(mention);

      if (confidence >= 60) {
        // Promote to B
        await base44.entities.HonoreeMention.update(mention.id, {
          confidence: 'B',
        });
        promoted.push({ id: mention.id, score: confidence, action: 'promoted_to_B' });
      } else if (confidence >= 75) {
        // Promote to A
        await base44.entities.HonoreeMention.update(mention.id, {
          confidence: 'A',
        });
        promoted.push({ id: mention.id, score: confidence, action: 'promoted_to_A' });
      } else {
        rejected.push({ id: mention.id, score: confidence });
      }
    }

    return Response.json({
      status: 'success',
      processed: mentions.length,
      promoted: promoted.length,
      rejected: rejected.length,
      promoted_mentions: promoted,
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});