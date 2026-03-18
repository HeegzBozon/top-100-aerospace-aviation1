import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Periodically scan USPTO for nominee patents
 * Admin-only scheduled function
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

    const nominees = await base44.asServiceRole.entities.Nominee.filter(
      { status: 'active' },
      null,
      1000
    );

    let created = 0;
    const results = [];

    for (const nominee of nominees) {
      try {
        if (!nominee.name) continue;

        // Query Google Patents for inventor
        const response = await fetch(
          `https://patents.google.com/?q=${encodeURIComponent(`inventor:${nominee.name}`)}&type=PATENT`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );

        if (!response.ok) {
          results.push({ nominee_id: nominee.id, status: 'error', message: 'Patents API error' });
          continue;
        }

        // Parse patents from response (simplified - real implementation would parse HTML)
        // For now, just log attempt
        results.push({
          nominee_id: nominee.id,
          status: 'processed',
          note: 'Patent search executed',
        });
      } catch (error) {
        results.push({ nominee_id: nominee.id, status: 'error', error: error.message });
      }
    }

    return Response.json({
      status: 'success',
      nominees_scanned: nominees.length,
      signals_created: created,
      results,
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});