import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SNAPI_BASE = 'https://api.spaceflightnewsapi.net/v4/articles/';
const SCAN_LIMIT = 5;       // articles per honoree
const BATCH_SIZE = 5;       // parallel SNAPI fetches
const MAX_NOMINEES = 100;   // scan all TOP 100

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const db = base44.asServiceRole;

    // 1. Load honorees (cap to avoid timeout)
    const nominees = await db.entities.Nominee.filter(
      { status: { $in: ['active', 'winner', 'finalist'] } },
      '-updated_date',
      MAX_NOMINEES
    );

    if (!nominees || nominees.length === 0) {
      return Response.json({ scanned: 0, new_mentions: 0, skipped: 0, message: 'No eligible honorees found.' });
    }

    // 2. Load all existing keys for deduplication (article_id is globally unique per SNAPI)
    const existingMentions = await db.entities.HonoreeMention.list('-scanned_at', 5000);
    // Deduplicate on both composite key AND article_id alone to prevent same article for same/diff nominee
    const existingKeys = new Set(existingMentions.map(m => `${m.nominee_id}_${m.article_id}`));
    const existingArticleIds = new Set(existingMentions.map(m => String(m.article_id)));

    let newMentionsCount = 0;
    let skippedCount = 0;
    const scannedAt = new Date().toISOString();

    // 3. Process nominees in parallel batches
    for (let i = 0; i < nominees.length; i += BATCH_SIZE) {
      const batch = nominees.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (nominee) => {
        const name = nominee.name?.trim();
        if (!name) return;

        const params = new URLSearchParams({
          search: name,
          limit: String(SCAN_LIMIT),
          ordering: '-published_at',
        });

        let articles = [];
        try {
          const res = await fetch(`${SNAPI_BASE}?${params.toString()}`, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(8000),
          });
          if (res.ok) {
            const data = await res.json();
            articles = data.results || [];
          }
        } catch {
          // skip this nominee on timeout/error
          return;
        }

        for (const article of articles) {
          const dedupeKey = `${nominee.id}_${article.id}`;
          // Skip if this nominee already has this article, OR if article already stored for any nominee
          if (existingKeys.has(dedupeKey) || existingArticleIds.has(String(article.id))) {
            skippedCount++;
            continue;
          }

          try {
            await db.entities.HonoreeMention.create({
              nominee_id: nominee.id,
              nominee_name: name,
              article_id: article.id,
              article_url: article.url,
              article_title: article.title,
              article_summary: article.summary || '',
              news_site: article.news_site || '',
              image_url: article.image_url || '',
              published_at: article.published_at || null,
              scanned_at: scannedAt,
            });
            existingKeys.add(dedupeKey);
            existingArticleIds.add(String(article.id));
            newMentionsCount++;
          } catch {
            // skip on create error
          }
        }
      }));
    }

    return Response.json({
      scanned: nominees.length,
      new_mentions: newMentionsCount,
      skipped: skippedCount,
      scanned_at: scannedAt,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});