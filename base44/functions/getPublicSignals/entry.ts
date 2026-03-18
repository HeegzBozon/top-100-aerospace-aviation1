import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Public API endpoint for signal data
 * Filters: nominee_id, signal_type, confidence, limit, offset
 */
Deno.serve(async (req) => {
  try {
    // Parse query params
    const url = new URL(req.url);
    const nomineeId = url.searchParams.get('nominee_id');
    const signalType = url.searchParams.get('signal_type');
    const confidence = url.searchParams.get('confidence') || 'A';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const base44 = createClientFromRequest(req);

    // Build query
    const query = { confidence };
    if (nomineeId) query.nominee_id = nomineeId;
    if (signalType) query.signal_type = signalType;

    // Fetch
    const signals = await base44.entities.SignalCard.filter(
      query,
      '-signal_date',
      limit + offset
    );

    const paginatedSignals = signals.slice(offset, offset + limit);

    return Response.json({
      status: 'success',
      data: paginatedSignals,
      pagination: {
        limit,
        offset,
        total: signals.length,
      },
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});