import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// ─────────────────────────────────────────────────────────────────
// Signal Type Detection
// ─────────────────────────────────────────────────────────────────

function detectSignalType(mention) {
  if (mention.source_name === 'Patents') return 'patent';
  if (mention.source_name === 'Research') return 'publication';
  if (mention.source_name === 'SNAPI' || mention.source_name === 'Google News RSS')
    return 'media_mention';
  return 'citation';
}

function extractTags(mention) {
  const tags = [];
  if (mention.article_title) {
    const keywords = [
      'aerospace', 'space', 'patent', 'research', 'innovation',
      'leadership', 'technology', 'mission', 'satellite', 'launch',
    ];
    for (const keyword of keywords) {
      if (mention.article_title.toLowerCase().includes(keyword)) {
        tags.push(keyword);
      }
    }
  }
  return tags.slice(0, 5);
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

    // Fetch all approved mentions (A/B confidence)
    const aSignals = await base44.entities.HonoreeMention.filter(
      { confidence: 'A' },
      '-created_date',
      500
    );
    const bSignals = await base44.entities.HonoreeMention.filter(
      { confidence: 'B' },
      '-created_date',
      500
    );
    const allMentions = [...(aSignals || []), ...(bSignals || [])];

    if (allMentions.length === 0) {
      return Response.json({ message: 'No signals to convert', created: 0 });
    }

    const createdCards = [];
    const seenKeys = new Set();

    for (const mention of allMentions) {
      const dedupeKey = `${mention.nominee_id}|${mention.article_id}|${mention.source_name}`;
      if (seenKeys.has(dedupeKey)) continue;
      seenKeys.add(dedupeKey);

      try {
        // Check if card already exists
        const existing = await base44.entities.SignalCard.filter({
          nominee_id: mention.nominee_id,
          evidence_links: mention.article_url,
        }, null, 1);

        if (existing && existing.length > 0) continue;

        const signalType = detectSignalType(mention);
        const tags = extractTags(mention);

        const card = await base44.entities.SignalCard.create({
          nominee_id: mention.nominee_id,
          headline: mention.article_title,
          evidence_links: [mention.article_url],
          source_name: mention.source_name,
          signal_type: signalType,
          signal_date: mention.published_at,
          confidence: mention.confidence,
          tags: tags,
          lens_mode: ['Authority', 'Performance', 'Archive'],
        });

        createdCards.push({
          id: card.id,
          nominee_id: mention.nominee_id,
          signal_type: signalType,
        });
      } catch (error) {
        console.error(`Failed to create signal card:`, error);
      }
    }

    return Response.json({
      message: 'Signal card generation complete',
      signals_processed: allMentions.length,
      cards_created: createdCards.length,
      by_type: {
        patent: createdCards.filter(c => c.signal_type === 'patent').length,
        publication: createdCards.filter(c => c.signal_type === 'publication').length,
        media_mention: createdCards.filter(c => c.signal_type === 'media_mention').length,
        citation: createdCards.filter(c => c.signal_type === 'citation').length,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});