import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// One-time migration toward a unified Candidate Pool model.
//
// Scans EVERY Nominee record (archive seasons included), groups them by
// normalized name, and for each person designates a single "master" record.
// The master's raw_nomination_data is augmented with:
//   - is_master: true
//   - season_participation: [{ nominee_id, season_id, status, rank }] for every
//     record in the group (so a master spans 2021 → present)
//   - merged_nominee_ids: the IDs of the duplicate records folded into the master
//
// This is strictly additive: no record is deleted, no id or season_id is
// changed, no score is touched. Season-scoped queries (standings, RankedVote,
// the Top 100 Women 2025 page) keep resolving against the original records
// exactly as before — the pool index simply rides alongside on the master.

const STATUS_PRIORITY = {
  winner: 5, finalist: 4, active: 3, approved: 2, pending: 1, rejected: 0,
};

function normName(name) {
  return (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function rankOf(n) {
  const r = n.raw_nomination_data || {};
  if (typeof r.rank === 'number') return r.rank;
  if (Array.isArray(r.archive_appearances)) {
    const withRank = r.archive_appearances.find((a) => typeof a.rank === 'number');
    if (withRank) return withRank.rank;
  }
  return null;
}

function pickMaster(group) {
  return group.slice().sort((a, b) => {
    const sp = (STATUS_PRIORITY[b.status] || 0) - (STATUS_PRIORITY[a.status] || 0);
    if (sp !== 0) return sp;
    return (b.created_date || '').localeCompare(a.created_date || '');
  })[0];
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;

    const service = base44.asServiceRole;

    // Cursor-paginate through all nominees via created_date so we never load
    // the full set in one shot. Gracefully degrades if $lt is unsupported.
    const all = [];
    const seen = new Set();
    let lastDate = null;
    for (let page = 0; page < 100; page++) {
      const query = lastDate ? { created_date: { $lt: lastDate } } : {};
      const batch = await service.entities.Nominee.filter(query, '-created_date', 1000);
      if (!batch.length) break;
      const fresh = batch.filter((n) => !seen.has(n.id));
      if (!fresh.length) break;
      fresh.forEach((n) => { seen.add(n.id); all.push(n); });
      lastDate = batch[batch.length - 1].created_date;
      if (batch.length < 1000) break;
    }

    // Group by normalized name.
    const groups = new Map();
    for (const n of all) {
      const key = normName(n.name);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(n);
    }

    const masters = [];
    let duplicateRecords = 0;
    let multiSeasonGroups = 0;
    for (const [, group] of groups) {
      if (group.length > 1) {
        duplicateRecords += group.length - 1;
        multiSeasonGroups += 1;
      }
      const master = pickMaster(group);
      const participation = group
        .map((n) => ({
          nominee_id: n.id,
          season_id: n.season_id || null,
          status: n.status || null,
          rank: rankOf(n),
        }))
        .filter((p) => p.season_id || p.status);
      const mergedIds = group.filter((n) => n.id !== master.id).map((n) => n.id);
      const existing = master.raw_nomination_data || {};
      masters.push({
        id: master.id,
        name: master.name,
        raw_nomination_data: {
          ...existing,
          is_master: true,
          season_participation: participation,
          merged_nominee_ids: mergedIds,
        },
      });
    }

    if (dryRun) {
      return Response.json({
        success: true,
        dry_run: true,
        total_nominees: all.length,
        unique_people: groups.size,
        duplicate_records: duplicateRecords,
        multi_season_groups: multiSeasonGroups,
        masters_to_update: masters.length,
        sample: masters.slice(0, 5).map((m) => ({
          id: m.id,
          name: m.name,
          participations: m.raw_nomination_data.season_participation.length,
          merged: m.raw_nomination_data.merged_nominee_ids.length,
        })),
      });
    }

    // Persist masters in batches of 500 (bulkUpdate cap).
    let updated = 0;
    for (let i = 0; i < masters.length; i += 500) {
      const slice = masters.slice(i, i + 500).map((m) => ({
        id: m.id,
        raw_nomination_data: m.raw_nomination_data,
      }));
      await service.entities.Nominee.bulkUpdate(slice);
      updated += slice.length;
    }

    return Response.json({
      success: true,
      dry_run: false,
      total_nominees: all.length,
      unique_people: groups.size,
      masters_updated: updated,
      duplicate_records_folded: duplicateRecords,
      multi_season_groups: multiSeasonGroups,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}