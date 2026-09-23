import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import {
  loadPool, scanSeasonDuplicates, findOrphans, mergeGroup, migrateLegacyNominations, isMerged,
  seasonTrack, linkIntakeToPool,
} from '../../shared/poolLink.ts';

// Admin-only Finalize Pool wizard backend.
// actions: backup | migrate_legacy | scan | orphans | merge | activate
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });

    const body = await req.json();
    const { action, season_id } = body;
    const sr = base44.asServiceRole;

    if (action === 'migrate_legacy') {
      return Response.json(await migrateLegacyNominations(sr));
    }

    const [pool, intakes] = await Promise.all([
      loadPool(sr),
      sr.entities.NominationIntake.list('-created_date', 5000),
    ]);

    if (action === 'backup') {
      const legacy = await sr.entities.Nomination.list('-created_date', 5000);
      const season = season_id ? await sr.entities.Season.get(season_id) : null;
      return Response.json({
        generated_at: new Date().toISOString(),
        generated_by: user.email,
        season: season ? { id: season.id, name: season.name, status: season.status } : null,
        counts: {
          nomination_intake: intakes.length,
          legacy_nominations: legacy.length,
          season_nominees: season_id ? pool.filter((n) => n.season_id === season_id).length : 0,
        },
        nomination_intake: intakes,
        legacy_nominations: legacy,
        season_nominees: season_id ? pool.filter((n) => n.season_id === season_id) : [],
      });
    }

    if (!season_id) return Response.json({ error: 'season_id is required' }, { status: 400 });

    const season = await sr.entities.Season.get(season_id);
    const track = seasonTrack(season?.name);

    if (action === 'scan') return Response.json(scanSeasonDuplicates(pool, season_id));
    if (action === 'orphans') return Response.json(findOrphans(pool, intakes, season_id, track));

    if (action === 'merge') {
      const ids = body.nominee_ids || [];
      const members = pool.filter((n) => ids.includes(n.id) && n.season_id === season_id && !isMerged(n));
      if (members.length < 2) return Response.json({ error: 'A merge needs at least two live records from this season' }, { status: 400 });
      return Response.json(await mergeGroup(sr, members, intakes));
    }

    if (action === 'activate') {
      const scan = scanSeasonDuplicates(pool, season_id);
      const orphans = findOrphans(pool, intakes, season_id, track);
      const openOrphans = orphans.unlinked_intakes.length + orphans.unbacked_nominees.length;
      if (scan.groups.length && !body.ack_duplicates) {
        return Response.json({ error: `${scan.groups.length} duplicate group(s) unresolved. Merge or acknowledge them first.` }, { status: 409 });
      }
      if (openOrphans && !body.ack_orphans && !body.carry_orphans) {
        return Response.json({ error: `${openOrphans} orphaned record(s) unresolved. Carry them over or acknowledge leaving them out.` }, { status: 409 });
      }

      // Carry-over: link approved-but-unlinked nominations, then bring every orphan into the pool.
      const carryIds = new Set();
      let orphanIntakesLinked = 0;
      if (body.carry_orphans) {
        for (const slim of orphans.unlinked_intakes) {
          const full = intakes.find((i) => i.id === slim.id);
          const r = await linkIntakeToPool(sr, full, season_id, pool);
          carryIds.add(r.nominee_id);
          orphanIntakesLinked++;
        }
        orphans.unbacked_nominees.forEach((n) => carryIds.add(n.id));
      }

      const seasonLive = pool.filter((n) => n.season_id === season_id && !isMerged(n));
      const toActivate = seasonLive.filter((n) => n.status === 'approved' || (carryIds.has(n.id) && n.status === 'pending'));
      for (let i = 0; i < toActivate.length; i += 200) {
        await sr.entities.Nominee.bulkUpdate(toActivate.slice(i, i + 200).map((n) => ({ id: n.id, status: 'active' })));
      }
      const alreadyActive = seasonLive.filter((n) => n.status === 'active').length;
      const finalizedAt = new Date().toISOString();
      const receipt = {
        finalized_at: finalizedAt,
        finalized_by: user.email,
        backup_downloaded_at: body.backup_downloaded_at || null,
        merges_performed: body.merges_performed || 0,
        orphans_resolved: body.orphans_resolved || 0,
        activated_now: toActivate.length,
        previously_active: alreadyActive,
        final_pool_size: alreadyActive + toActivate.length,
        still_pending: seasonLive.filter((n) => n.status === 'pending').length,
        returning_honorees: scan.returning_count,
        acknowledged_duplicate_groups: body.ack_duplicates ? scan.groups.length : 0,
        acknowledged_orphans: !body.carry_orphans && body.ack_orphans ? openOrphans : 0,
        orphans_carried: carryIds.size,
        orphan_nominations_linked: orphanIntakesLinked,
      };
      await sr.entities.Season.update(season_id, { pool_finalized_at: finalizedAt, pool_finalization_receipt: receipt });
      console.log('POOL_FINALIZED', season_id, JSON.stringify(receipt));
      return Response.json({ receipt });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}