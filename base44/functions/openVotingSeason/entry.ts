import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveCohorts } from '../../shared/votingWindow.ts';

// The toggles that take voting live, in one place.
//
// Opening voting is a data change on the Season records, never a code change: this
// flips every cohort (or the ones named) to voting_open, or back to review. The
// voting close date is never touched here — that is an editorial decision made in the
// Season Manager, and a launch toggle must not move a deadline.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { season_ids, action } = await req.json().catch(() => ({}));
    const mode = action === 'close' ? 'close' : 'open';

    const service = base44.asServiceRole;
    const { cohorts } = await resolveCohorts(service);

    const named = Array.isArray(season_ids) && season_ids.length ? new Set(season_ids) : null;
    const targets = cohorts.filter((c) => {
      if (named) return named.has(c.id);
      // Every cohort that can still be voted on this cycle.
      return !['completed', 'archived'].includes(c.status);
    });

    if (!targets.length) {
      return Response.json({ error: 'No cohorts matched that request.' }, { status: 400 });
    }

    const nextStatus = mode === 'open' ? 'voting_open' : 'review';
    const updated = [];
    const skipped = [];

    for (const cohort of targets) {
      // A cohort with no window cannot be opened honestly: an open ballot with no
      // close date never closes.
      if (mode === 'open' && !cohort.voting_end) {
        skipped.push({ id: cohort.id, name: cohort.name, reason: 'No voting close date is set.' });
        continue;
      }
      await service.entities.Season.update(cohort.id, { status: nextStatus });
      updated.push({ id: cohort.id, name: cohort.name, status: nextStatus });
    }

    const after = await resolveCohorts(service);

    return Response.json({
      success: true,
      action: mode,
      updated,
      skipped,
      open_count: after.open.length,
      cohorts: after.cohorts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}