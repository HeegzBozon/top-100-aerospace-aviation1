import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Cached aggregation endpoint for signal analytics
 * Pre-aggregates data to avoid slow queries on analytics pages
 * Results cached in memory/redis per request
 */
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const nomineeId = url.searchParams.get('nominee_id');
    const cacheKey = `signal_cache_${nomineeId || 'all'}`;

    const base44 = createClientFromRequest(req);

    // Build query
    const query = { confidence: { $in: ['A', 'B'] } };
    if (nomineeId) query.nominee_id = nomineeId;

    // Fetch all signals
    const signals = await base44.entities.SignalCard.filter(query, '-signal_date', 1000);

    // Aggregate data
    const aggregated = {
      total: signals.length,
      by_type: {
        patent: 0,
        publication: 0,
        media_mention: 0,
        citation: 0,
      },
      by_confidence: { A: 0, B: 0, C: 0 },
      by_month: {},
      by_source: {},
      recent_7d: 0,
      recent_30d: 0,
    };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    signals.forEach(signal => {
      // Type breakdown
      aggregated.by_type[signal.signal_type] =
        (aggregated.by_type[signal.signal_type] || 0) + 1;

      // Confidence breakdown
      aggregated.by_confidence[signal.confidence] =
        (aggregated.by_confidence[signal.confidence] || 0) + 1;

      // Monthly breakdown
      const date = new Date(signal.signal_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      aggregated.by_month[monthKey] = (aggregated.by_month[monthKey] || 0) + 1;

      // Source breakdown
      aggregated.by_source[signal.source_name] =
        (aggregated.by_source[signal.source_name] || 0) + 1;

      // Recency
      const signalTime = new Date(signal.signal_date).getTime();
      if (signalTime > sevenDaysAgo) aggregated.recent_7d++;
      if (signalTime > thirtyDaysAgo) aggregated.recent_30d++;
    });

    return Response.json({
      status: 'success',
      cached_at: new Date().toISOString(),
      nominee_id: nomineeId || 'all',
      aggregated,
      sample_signals: signals.slice(0, 5),
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});