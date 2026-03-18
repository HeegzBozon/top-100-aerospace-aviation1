import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Detect trending signals based on:
 * - Velocity (recent activity)
 * - Tag frequency
 * - Multiple nominees mentioning same topic
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch recent signals (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const recentSignals = await base44.entities.SignalCard.filter(
      { confidence: { $in: ['A', 'B'] } },
      '-signal_date',
      500
    );

    const trendingSignals = recentSignals.filter(
      s => new Date(s.signal_date) > fourteenDaysAgo
    );

    // Tag frequency
    const tagFrequency = {};
    trendingSignals.forEach(s => {
      if (s.tags && Array.isArray(s.tags)) {
        s.tags.forEach(tag => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }
    });

    // Type frequency
    const typeFrequency = {};
    trendingSignals.forEach(s => {
      typeFrequency[s.signal_type] = (typeFrequency[s.signal_type] || 0) + 1;
    });

    // Source frequency
    const sourceFrequency = {};
    trendingSignals.forEach(s => {
      sourceFrequency[s.source_name] = (sourceFrequency[s.source_name] || 0) + 1;
    });

    // Calculate trend score
    const trendScores = trendingSignals.map(signal => {
      let score = 0;
      const daysSince = Math.max(
        1,
        (Date.now() - new Date(signal.signal_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Recent boost (decay over time)
      score += Math.max(1, 14 - daysSince);

      // Tag popularity boost
      if (signal.tags) {
        signal.tags.forEach(tag => {
          score += Math.log(tagFrequency[tag] || 1);
        });
      }

      return {
        signal_id: signal.id,
        nominee_id: signal.nominee_id,
        headline: signal.headline,
        signal_type: signal.signal_type,
        source_name: signal.source_name,
        signal_date: signal.signal_date,
        tags: signal.tags || [],
        trend_score: score,
      };
    });

    // Top trending
    const topTrending = trendScores.sort((a, b) => b.trend_score - a.trend_score).slice(0, 20);

    return Response.json({
      status: 'success',
      period_days: 14,
      signals_analyzed: trendingSignals.length,
      trending: topTrending,
      tag_frequency: tagFrequency,
      type_frequency: typeFrequency,
      source_frequency: sourceFrequency,
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});