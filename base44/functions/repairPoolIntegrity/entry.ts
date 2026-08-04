import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/**
 * One-time pool integrity repair, run before Season 4 voting opens.
 *
 * 1. PAIRWISE APPEARANCE REPAIR
 *    Rows where pairwise_appearance_count = 0 but total_wins + total_losses > 0
 *    get pairwise_appearance_count set to (total_wins + total_losses).
 *    This restores the Bradley-Terry / Thurstone denominator without touching
 *    who is in the pairwise field.
 *
 * 2. JUNK ROW REMOVAL
 *    Deletes obvious test rows: name (trimmed, lowercased) in {test, test555},
 *    or blank name with no email AND no LinkedIn URL.
 *
 * Admin-only. Returns a report of exactly what changed.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const Nom = base44.asServiceRole.entities.Nominee;

    // Load the full pool. 762 < 2000, one call is enough.
    const all = await Nom.list('-created_date', 2000);

    // --- 1. Pairwise repair ---
    const toFix = all.filter((n) => {
      const wins = n.total_wins || 0;
      const losses = n.total_losses || 0;
      const apps = n.pairwise_appearance_count || 0;
      return apps === 0 && wins + losses > 0;
    });
    const updates = toFix.map((n) => ({
      id: n.id,
      pairwise_appearance_count: (n.total_wins || 0) + (n.total_losses || 0),
    }));
    let repairResult = null;
    if (updates.length) {
      repairResult = await Nom.bulkUpdate(updates);
    }

    // --- 2. Junk row removal ---
    const junk = all.filter((n) => {
      const name = (n.name || '').trim().toLowerCase();
      if (name === 'test' || name === 'test555') return true;
      // blank name AND no contact info = clearly junk
      if (name === '' && !n.nominee_email && !n.linkedin_profile_url) return true;
      return false;
    });
    let deleteResult = null;
    if (junk.length) {
      deleteResult = await Nom.deleteMany({ id: { $in: junk.map((n) => n.id) } });
    }

    return Response.json({
      status: 'success',
      pool_size: all.length,
      pairwise_defects_found: toFix.length,
      pairwise_repaired: repairResult ? updates.length : 0,
      pairwise_repair_result: repairResult,
      junk_found: junk.length,
      junk_deleted: deleteResult,
      junk_detail: junk.map((n) => ({ id: n.id, name: n.name, email: n.nominee_email })),
    });
  } catch (error) {
    return Response.json({ status: 'error', message: error.message, stack: error.stack }, { status: 500 });
  }
}