import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  seasonPoolQuery, linkToSeasonPatch, groupByPerson, personKeys,
} from '../../shared/seasonMembership.ts';

// Link-based nominee rollover + backfill. One function backs three flows:
//   - Auto-rollover (workflow): target season, sources = all prior same-cohort.
//   - Manual "Rollover now" (admin): same as auto, admin-triggered.
//   - One-time backfill (admin): target season + explicit source_season_ids
//     (e.g. men 2026 from the four archival pools).
//
// For every unique person across the source seasons (deduped by canonical
// LinkedIn slug then email), links their representative record into the target
// season by adding the target to season_ids and seeding a reset season_scores
// snapshot — without creating a duplicate Nominee record. Target-native
// duplicates of a linked person are retired (within-target merge) so the target
// cohort shows each person once. Writes a receipt to the target season's
// rollover_config.rollover_stats (and pool_finalization_receipt when backfilling).
//
// Idempotent: a person already a member of the target season is skipped.

const NON_REJECTED = ['pending', 'approved', 'active', 'winner', 'finalist'];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const targetSeasonId = body.target_season_id;

    // Auth: admin when a user is present (manual trigger); workflow invocation
    // carries __source: 'workflow' and runs under the service role.
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }
    if (!user && body.__source !== 'workflow') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!targetSeasonId) {
      return Response.json({ error: 'target_season_id is required' }, { status: 400 });
    }

    const sr = base44.asServiceRole;
    const target = await sr.entities.Season.get(targetSeasonId);
    if (!target) return Response.json({ error: 'Target season not found' }, { status: 404 });
    if (target.is_group) {
      return Response.json({ error: 'Target must be a cohort season, not a group' }, { status: 400 });
    }

    // Resolve source seasons.
    let sourceSeasonIds: string[] = Array.isArray(body.source_season_ids) && body.source_season_ids.length
      ? body.source_season_ids.filter(Boolean)
      : [];
    if (!sourceSeasonIds.length) {
      // Default: every prior season of the same cohort_key (auto-rollover chain).
      const all = await sr.entities.Season.list('-created_date', 500);
      sourceSeasonIds = (all || [])
        .filter((s) => s.id !== targetSeasonId && !s.is_group && s.cohort_key === target.cohort_key)
        .map((s) => s.id);
    }
    if (!sourceSeasonIds.length) {
      return Response.json({
        receipt: { target_season_id: targetSeasonId, sources: [], linked: 0, skipped_already_member: 0, merged_target_duplicates: 0, returning_honorees: 0 },
        message: 'No prior same-cohort seasons found to roll over.',
      });
    }

    // Load all non-rejected nominees from source seasons + the target season.
    const sourcePool: any[] = [];
    for (const sid of sourceSeasonIds) {
      const batch = await sr.entities.Nominee.filter({ season_id: sid }, '-created_date', 5000);
      for (const n of batch || []) {
        if (n.status !== 'rejected' && !n.raw_nomination_data?.merged_into) sourcePool.push(n);
      }
    }
    const targetPool = await sr.entities.Nominee.filter(seasonPoolQuery(targetSeasonId), '-created_date', 5000);

    // Dedupe across all sources by slug then email. Within each group, pick a
    // representative: prefer a target-native record, else the most complete
    // source record; tiebreak by oldest.
    // Dedupe by id: a record linked to both a source season and the target
    // (season_ids contains target) appears in both fetches. Keep one copy so
    // union-find grouping and bulkUpdate never operate on the same id twice.
    const all: any[] = [];
    const seenIds = new Set<string>();
    for (const n of [...sourcePool, ...targetPool]) {
      if (n && n.id && !seenIds.has(n.id)) { seenIds.add(n.id); all.push(n); }
    }
    const groups = groupByPerson(all);
    const completeness = (n: any) =>
      [n.name, n.nominee_email, n.linkedin_profile_url, n.title, n.company, n.country, n.bio, n.avatar_url]
        .filter((v) => v && String(v).trim()).length
      + (Array.isArray(n.season_ids) ? n.season_ids.length : 0);
    const byOldest = (a: any, b: any) => String(a.created_date || '').localeCompare(String(b.created_date || ''));

    let linked = 0;
    let skippedAlready = 0;
    let mergedTargetDups = 0;
    let returningHonorees = 0;
    const sourceIds = new Set(sourceSeasonIds);
    const bulkUpdates: any[] = [];
    const dupRetire: any[] = [];
    const mergedAt = new Date().toISOString();

    for (const group of groups) {
      const members = group.map((i) => all[i]);
      const targetNatives = members.filter((n) => n.season_id === targetSeasonId || (Array.isArray(n.season_ids) && n.season_ids.includes(targetSeasonId)));
      const sourceMembers = members.filter((n) => sourceIds.has(n.season_id) || (n.season_id !== targetSeasonId && (Array.isArray(n.season_ids) ? n.season_ids.some((id: string) => sourceIds.has(id)) : true)));

      // Representative: target-native first, else most-complete source record.
      let rep: any;
      if (targetNatives.length) {
        rep = [...targetNatives].sort(byOldest)[0];
      } else {
        rep = [...sourceMembers].sort((a, b) => completeness(b) - completeness(a) || byOldest(a, b))[0];
      }
      if (!rep) continue;

      // If the representative is a source (non-target) record, this is a
      // returning honoree being linked into the target season.
      const isReturning = !targetNatives.length;

      // Idempotently link the representative into the target season (batched).
      const alreadyMember = Array.isArray(rep.season_ids) ? rep.season_ids.includes(targetSeasonId) : false;
      if (alreadyMember && rep.season_scores?.[targetSeasonId]) {
        skippedAlready++;
      } else {
        const patch = linkToSeasonPatch(rep, targetSeasonId, 'active');
        if (patch) { bulkUpdates.push(patch); linked++; if (isReturning) returningHonorees++; }
      }

      // Retire target-native duplicates of this person so the cohort shows
      // them once. Only target-native dups are merged; source records are never
      // mutated (they keep their archival season_id).
      for (const d of targetNatives.filter((n) => n.id !== rep.id)) {
        dupRetire.push({
          id: d.id,
          status: 'rejected',
          raw_nomination_data: {
            ...(d.raw_nomination_data || {}),
            merged_into: rep.id,
            merged_at: mergedAt,
            pre_merge_status: d.status,
            merged_reason: 'rollover_target_dedup',
          },
        });
        mergedTargetDups++;
      }
    }

    // Flush all writes in 500-record batches instead of one DB call per record.
    const allUpdates = [...bulkUpdates, ...dupRetire];
    for (let i = 0; i < allUpdates.length; i += 500) {
      await sr.entities.Nominee.bulkUpdate(allUpdates.slice(i, i + 500));
    }

    // Write receipt to the target season.
    const receipt = {
      rolled_at: new Date().toISOString(),
      rolled_by: user?.email || 'workflow',
      target_season_id: targetSeasonId,
      sources: sourceSeasonIds,
      source_records: sourcePool.length,
      unique_persons: groups.length,
      linked,
      skipped_already_member: skippedAlready,
      merged_target_duplicates: mergedTargetDups,
      returning_honorees: returningHonorees,
    };

    const rolloverConfig = {
      ...(target.rollover_config || {}),
      enabled: true,
      source_season_ids: sourceSeasonIds,
      rollover_completed: true,
      rollover_stats: {
        eligible_count: sourcePool.length,
        revalidated_count: linked,
        declined_count: 0,
        pending_count: 0,
        unique_persons: groups.length,
        returning_honorees: returningHonorees,
        merged_target_duplicates: mergedTargetDups,
      },
    };
    const seasonPatch: any = { rollover_config: rolloverConfig };
    // Backfill (explicit sources) also stamps pool_finalization_receipt so the
    // one-time men 2026 backfill shows up in the existing receipt surface.
    if (Array.isArray(body.source_season_ids) && body.source_season_ids.length) {
      seasonPatch.pool_finalization_receipt = {
        ...(target.pool_finalization_receipt || {}),
        backfilled_at: receipt.rolled_at,
        backfilled_by: receipt.rolled_by,
        backfill_sources: sourceSeasonIds,
        backfill_linked: linked,
        backfill_returning_honorees: returningHonorees,
        backfill_merged_target_duplicates: mergedTargetDups,
      };
    }
    await sr.entities.Season.update(targetSeasonId, seasonPatch);

    console.log('ROLLOVER', JSON.stringify(receipt));
    return Response.json({ receipt });
  } catch (error) {
    console.error('rolloverNominees error:', error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}