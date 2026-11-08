import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { readBallotMeasurement } from '../../shared/ballotMeasurement.ts';

// The reading the committee's live monitor is built on: one cohort's pool, the marks each
// lane has written, and how much of that pool each lane has reached. Read-only, admin only,
// and aggregate throughout — no voter is named and no ballot is opened.
//
// It answers the same shape getSelectionAnalytics folds into its totals, through the same
// shared module, so the two monitors can never hold different definitions of a sitting, a
// mark, or the pool they are scaled against.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const ids = (Array.isArray(body?.season_ids) ? body.season_ids : [body?.season_id]).filter(Boolean);

    // A reading is always cut against a named cohort. With none named there is no pool to
    // scale it against, so the surface is told so rather than handed a total from elsewhere.
    if (!ids.length) {
      return Response.json({ error: 'A cohort must be named to read its pool.' }, { status: 400 });
    }

    const reading = await readBallotMeasurement(base44.asServiceRole, ids);
    if (!reading) {
      return Response.json({ error: 'No cohort pool could be resolved.' }, { status: 409 });
    }

    return Response.json({ success: true, ...reading });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}