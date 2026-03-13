import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Periodically scan google scholar for nominee publications
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
        // Query semantic scholar for author publications
        if (!nominee.name) continue;

        const response = await fetch(
          `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(nominee.name)}&fields=paperId,name,papers`,
          { headers: { Accept: 'application/json' } }
        );

        if (!response.ok) {
          results.push({ nominee_id: nominee.id, status: 'error', message: 'Scholar API error' });
          continue;
        }

        const data = await response.json();
        const author = data.data?.[0];

        if (!author || !author.papers) {
          results.push({ nominee_id: nominee.id, status: 'skipped', message: 'No papers found' });
          continue;
        }

        // Check for existing signals to avoid duplicates
        const existingSignals = await base44.asServiceRole.entities.SignalCard.filter(
          { nominee_id: nominee.id, signal_type: 'publication' },
          null,
          1000
        );

        const existingHeadlines = new Set(existingSignals.map(s => s.headline));

        // Create signals for new papers
        for (const paper of author.papers.slice(0, 10)) {
          if (existingHeadlines.has(paper.title)) continue;

          try {
            await base44.asServiceRole.entities.SignalCard.create({
              nominee_id: nominee.id,
              headline: `Published: ${paper.title}`,
              evidence_links: paper.url ? [paper.url] : [],
              source_name: 'Google Scholar',
              signal_type: 'publication',
              signal_date: new Date(paper.year || Date.now()).toISOString(),
              confidence: 'B',
              tags: ['research', 'publication'],
            });
            created++;
          } catch (err) {
            console.error('Paper creation error:', err);
          }
        }

        results.push({ nominee_id: nominee.id, status: 'processed', papers_scanned: author.papers.length });
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