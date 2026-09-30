import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { snapshotFlatScores } from '../../shared/seasonMembership.ts';

// One-time, idempotent migration to the link-model season membership fields.
// For every Nominee: if `season_ids` is absent/empty, seed it from `season_id`;
// if `season_scores[season_id]` is absent, snapshot the current flat score fields
// into it. Does NOT merge cross-season duplicates or change season_id — archival
// reads and existing season_id-based reads keep working unchanged. Safe to run
// repeatedly: already-migrated records are skipped.
//
// action 'export' (default): returns a pre-flight snapshot of counts (no writes).
// action 'migrate': performs the writes and returns a receipt.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'export';
    const sr = base44.asServiceRole;

    // Paginate the full Nominee set.
    const records: any[] = [];
    const seen = new Set<string>();
    let lastDate: string | null = null;
    for (let page = 0; page < 100; page++) {
      const query: any = lastDate ? { created_date: { $lt: lastDate } } : {};
      const batch = await sr.entities.Nominee.filter(query, '-created_date', 1000);
      if (!batch.length) break;
      const fresh = batch.filter((n: any) => !seen.has(n.id));
      if (!fresh.length) break;
      fresh.forEach((n: any) => seen.add(n.id));
      records.push(...fresh);
      lastDate = batch[batch.length - 1].created_date;
      if (batch.length < 1000) break;
    }

    let needsMigration = 0;
    let needsScores = 0;
    let migrated = 0;
    let scored = 0;
    let noSeason = 0;

    for (const n of records) {
      const hasIds = Array.isArray(n.season_ids) && n.season_ids.length;
      const sid = n.season_id;
      if (!sid && !hasIds) { noSeason++; continue; }
      if (!hasIds) needsMigration++;
      const scores = n.season_scores || {};
      if (sid && !scores[sid]) needsScores++;
    }

    if (action === 'export') {
      return Response.json({
        action: 'export',
        total_records: records.length,
        needs_season_ids: needsMigration,
        needs_season_scores: needsScores,
        no_season_id: noSeason,
        note: 'Run with action:"migrate" to seed season_ids and season_scores. No cross-season merging is performed; archival reads are unaffected.',
      });
    }

    // action === 'migrate' — batch updates (bulkUpdate, up to 500 per call).
    const updates: any[] = [];
    for (const n of records) {
      const sid = n.season_id;
      const ids = Array.isArray(n.season_ids) ? [...n.season_ids] : [];
      const scores: Record<string, any> = { ...(n.season_scores || {}) };
      const patch: any = { id: n.id };
      let changed = false;
      if (sid && !ids.includes(sid)) { ids.push(sid); patch.season_ids = ids; changed = true; }
      else if (!Array.isArray(n.season_ids) && sid) { patch.season_ids = [sid]; changed = true; }
      if (sid && !scores[sid]) { scores[sid] = snapshotFlatScores(n, sid); patch.season_scores = scores; changed = true; }
      if (changed) {
        updates.push(patch);
        if (patch.season_ids) migrated++;
        if (patch.season_scores) scored++;
      }
    }
    for (let i = 0; i < updates.length; i += 500) {
      await sr.entities.Nominee.bulkUpdate(updates.slice(i, i + 500));
    }

    const receipt = {
      migrated_at: new Date().toISOString(),
      migrated_by: user.email,
      total_records: records.length,
      season_ids_seeded: migrated,
      season_scores_seeded: scored,
      no_season_id: noSeason,
    };
    console.log('MIGRATE_SEASONS', JSON.stringify(receipt));
    return Response.json({ receipt });
  } catch (error) {
    console.error('migrateNomineeSeasons error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}