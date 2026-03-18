import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Enrich signals with author bio, org context, and impact metrics
 * Fetches from semantic scholar and other sources
 * Admin-only
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

    const unenrichedSignals = await base44.asServiceRole.entities.SignalCard.filter(
      { ai_summary: null },
      '-signal_date',
      100
    );

    let enrichedCount = 0;
    const results = [];

    for (const signal of unenrichedSignals) {
      try {
        // Try to find author info via semantic scholar
        const authorInfo = await fetchAuthorInfo(signal.headline);

        const enrichedData = {
          author_name: authorInfo?.author_name || null,
          author_bio: authorInfo?.author_bio || null,
          organization: authorInfo?.organization || null,
          impact_metrics: authorInfo?.impact_metrics || null,
          enriched_at: new Date().toISOString(),
        };

        await base44.asServiceRole.entities.SignalCard.update(signal.id, enrichedData);
        enrichedCount++;
        results.push({ signal_id: signal.id, status: 'enriched' });
      } catch (err) {
        results.push({ signal_id: signal.id, status: 'error', error: err.message });
      }
    }

    return Response.json({
      status: 'success',
      processed: unenrichedSignals.length,
      enriched: enrichedCount,
      results,
    });
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
});

/**
 * Fetch author info from semantic scholar API
 */
async function fetchAuthorInfo(headline) {
  try {
    // Extract author name from headline (heuristic)
    const authorMatch = headline.match(/by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/i);
    const authorName = authorMatch ? authorMatch[1] : null;

    if (!authorName) return {};

    // Query semantic scholar
    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(authorName)}&fields=name,affiliations,hIndex,paperCount,citationCount`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) return {};

    const data = await response.json();
    const author = data.data?.[0];

    if (!author) return {};

    return {
      author_name: author.name,
      author_bio: `${author.affiliations?.join(', ') || 'Unknown affiliation'} | ${author.paperCount || 0} papers`,
      organization: author.affiliations?.[0] || null,
      impact_metrics: {
        h_index: author.hIndex || 0,
        citation_count: author.citationCount || 0,
      },
    };
  } catch (error) {
    console.error('Semantic scholar fetch error:', error);
    return {};
  }
}