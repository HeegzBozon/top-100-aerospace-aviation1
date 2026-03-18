import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Get all signals for a specific nominee (high-confidence only)
 */
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const nomineeId = url.searchParams.get('nominee_id');

    if (!nomineeId) {
      return Response.json(
        { status: 'error', message: 'nominee_id required' },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    const signals = await base44.entities.SignalCard.filter(
      { nominee_id: nomineeId, confidence: { $in: ['A', 'B'] } },
      '-signal_date',
      200
    );

    // Aggregate by type
    const byType = {
      patent: signals.filter(s => s.signal_type === 'patent'),
      publication: signals.filter(s => s.signal_type === 'publication'),
      media_mention: signals.filter(s => s.signal_type === 'media_mention'),
      citation: signals.filter(s => s.signal_type === 'citation'),
    };

    return Response.json({
      status: 'success',
      nominee_id: nomineeId,
      total: signals.length,
      by_type: {
        patent: byType.patent.length,
        publication: byType.publication.length,
        media_mention: byType.media_mention.length,
        citation: byType.citation.length,
      },
      signals,
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});