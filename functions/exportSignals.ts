import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Export signals as CSV
 * Filters: nominee_id, signal_type, confidence, format (csv or json)
 */
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const nomineeId = url.searchParams.get('nominee_id');
    const signalType = url.searchParams.get('signal_type');
    const confidence = url.searchParams.get('confidence') || 'A';
    const format = url.searchParams.get('format') || 'csv';

    const base44 = createClientFromRequest(req);

    // Build query
    const query = { confidence };
    if (nomineeId) query.nominee_id = nomineeId;
    if (signalType) query.signal_type = signalType;

    // Fetch signals
    const signals = await base44.entities.SignalCard.filter(query, '-signal_date', 1000);

    if (format === 'json') {
      return Response.json(
        {
          status: 'success',
          exported_at: new Date().toISOString(),
          count: signals.length,
          signals,
        },
        {
          headers: {
            'Content-Disposition': 'attachment; filename="signals.json"',
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // CSV format
    const headers = [
      'ID',
      'Nominee ID',
      'Headline',
      'Type',
      'Source',
      'Confidence',
      'Date',
      'Tags',
      'Evidence Links',
    ];

    const rows = signals.map(s => [
      s.id,
      s.nominee_id,
      `"${s.headline.replace(/"/g, '""')}"`,
      s.signal_type,
      s.source_name,
      s.confidence,
      new Date(s.signal_date).toISOString(),
      s.tags ? `"${s.tags.join(', ')}"` : '',
      s.evidence_links ? `"${s.evidence_links.join(', ')}"` : '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="signals.csv"',
      },
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});