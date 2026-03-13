import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─────────────────────────────────────────────────────────────────
// Google Patents Search (via public URL)
// ─────────────────────────────────────────────────────────────────

async function fetchGooglePatents(query, limit = 10) {
  try {
    const searchUrl = `https://patents.google.com/?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    if (!response.ok) return [];

    const html = await response.text();
    // Extract patent IDs from page
    const patentRegex = /\/patent\/([A-Z0-9]+)\//g;
    const matches = [...html.matchAll(patentRegex)];
    const patentIds = matches.slice(0, limit).map(m => m[1]);

    const results = [];
    for (const patentId of patentIds) {
      results.push({
        patent_id: patentId,
        patent_url: `https://patents.google.com/patent/${patentId}`,
        title: `Patent ${patentId}`,
        source: 'Google Patents',
      });
    }
    return results;
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
// Google Scholar via ORCID (simplified via semantic scholar)
// ─────────────────────────────────────────────────────────────────

async function fetchScholarCitations(name, orcidId) {
  try {
    // Use Semantic Scholar API (free tier) to search by author name + ORCID
    const authorQuery = orcidId || name;
    const url = `https://api.semanticscholar.org/v1/author/search?query=${encodeURIComponent(authorQuery)}&limit=5`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    if (!data.data || data.data.length === 0) return [];

    const author = data.data[0];
    const papersUrl = `https://api.semanticscholar.org/v1/author/${author.authorId}/papers?limit=10`;
    const papersResp = await fetch(papersUrl);
    if (!papersResp.ok) return [];

    const papersData = await papersResp.json();
    return (papersData.papers || []).map(paper => ({
      paper_id: paper.paperId,
      paper_url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      title: paper.title,
      venue: paper.venue || 'Unknown',
      year: paper.year,
      citation_count: paper.citationCount || 0,
      source: 'Google Scholar (Semantic Scholar)',
    }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────
// Main Handler
// ─────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch nominees with ORCID
    const nominees = await base44.entities.Nominee.filter(
      { status: 'active' },
      null,
      1000
    );
    if (!nominees || nominees.length === 0) {
      return Response.json({ message: 'No nominees found', created: 0 });
    }

    const createdSignals = [];
    const seenKeys = new Set();

    for (const nominee of nominees) {
      // Patents
      const patentQuery = nominee.name;
      const patents = await fetchGooglePatents(patentQuery, 5);
      for (const patent of patents) {
        const dedupeKey = `${nominee.id}|patent|${patent.patent_id}`;
        if (seenKeys.has(dedupeKey)) continue;
        seenKeys.add(dedupeKey);

        try {
          // Check if already exists
          const existing = await base44.entities.HonoreeMention.filter({
            nominee_id: nominee.id,
            source_name: 'Patents',
            article_id: parseInt(patent.patent_id) || 0,
          }, null, 1);

          if (existing && existing.length > 0) continue;

          await base44.entities.HonoreeMention.create({
            nominee_id: nominee.id,
            nominee_name: nominee.name,
            article_id: parseInt(patent.patent_id) || 0,
            article_url: patent.patent_url,
            article_title: patent.title,
            article_summary: `Patent filed by ${nominee.name}`,
            news_site: 'Google Patents',
            image_url: null,
            published_at: new Date().toISOString(),
            scanned_at: new Date().toISOString(),
            confidence: 'A',
            source_name: 'Patents',
          });

          createdSignals.push({
            nominee_id: nominee.id,
            type: 'patent',
            url: patent.patent_url,
          });
        } catch (error) {
          console.error(`Failed to create patent signal:`, error);
        }
      }

      // Citations/Papers
      if (nominee.orcid_id) {
        const papers = await fetchScholarCitations(nominee.name, nominee.orcid_id);
        for (const paper of papers) {
          const dedupeKey = `${nominee.id}|citation|${paper.paper_id}`;
          if (seenKeys.has(dedupeKey)) continue;
          seenKeys.add(dedupeKey);

          try {
            const existing = await base44.entities.HonoreeMention.filter({
              nominee_id: nominee.id,
              source_name: 'Research',
              article_id: parseInt(paper.paper_id) || 0,
            }, null, 1);

            if (existing && existing.length > 0) continue;

            await base44.entities.HonoreeMention.create({
              nominee_id: nominee.id,
              nominee_name: nominee.name,
              article_id: parseInt(paper.paper_id) || 0,
              article_url: paper.paper_url,
              article_title: paper.title,
              article_summary: `Published in ${paper.venue} (${paper.year}) - ${paper.citation_count} citations`,
              news_site: 'Semantic Scholar',
              image_url: null,
              published_at: new Date(paper.year, 0).toISOString(),
              scanned_at: new Date().toISOString(),
              confidence: 'A',
              source_name: 'Research',
            });

            createdSignals.push({
              nominee_id: nominee.id,
              type: 'publication',
              url: paper.paper_url,
            });
          } catch (error) {
            console.error(`Failed to create citation signal:`, error);
          }
        }
      }
    }

    return Response.json({
      message: 'Scan complete',
      nominees_scanned: nominees.length,
      signals_created: createdSignals.length,
      summary: {
        patents: createdSignals.filter(s => s.type === 'patent').length,
        publications: createdSignals.filter(s => s.type === 'publication').length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});