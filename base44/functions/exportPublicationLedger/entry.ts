import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { csvEscape } from '../../shared/nomineeResolve.ts';

// Admin-only CSV of the two datasets captured on the published Top 100 Women
// edition: the "Notify Me" waitlist and the profile claim requests on the roster.
// One dataset per call so each button writes exactly the surface it is named for.
// Provenance for internal review only; never read by discovery, ranking or scoring.
const PUBLIC_SITE = 'https://top100aero.space';

const WAITLIST_HEADERS = [
  'Signed Up', 'Email', 'Publication', 'Surface', 'Status', 'Notified', 'Notes', 'Signup ID',
];

const CLAIM_HEADERS = [
  'Honoree', 'Profile URL', 'Claim Status', 'Claim Method',
  'Claim Requested By', 'Claim Requested Date',
  'Owner User ID', 'Owner Email (legacy)',
  'Verification Status', 'Profile Status', 'Season', 'Nominee ID',
];

function waitlistRow(r: any): string {
  return [
    r.created_date, r.email, r.publication, r.surface,
    r.status || 'waiting', r.notified_date, r.notes, r.id,
  ].map(csvEscape).join(',');
}

function claimRow(n: any): string {
  return [
    n.name, `${PUBLIC_SITE}/profiles/${n.id}`, n.claim_status, n.claim_method,
    n.claim_requested_by, n.claim_requested_date,
    n.claimed_by_user_id, n.claimed_by_user_email,
    n.verified_status, n.status, n.season_id, n.id,
  ].map(csvEscape).join(',');
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dataset = body?.dataset;

    if (dataset === 'waitlist') {
      const signups = await base44.asServiceRole.entities.PublicationWaitlist.list('-created_date', 5000);
      if (!signups || signups.length === 0) {
        return Response.json({ error: 'No "Notify Me" signups recorded yet' }, { status: 404 });
      }
      const csv = [WAITLIST_HEADERS.join(','), ...signups.map(waitlistRow)].join('\n');
      const waiting = signups.filter((s: any) => (s.status || 'waiting') === 'waiting').length;
      return Response.json({ success: true, dataset, csv, count: signups.length, waiting });
    }

    if (dataset === 'claims') {
      // The roster as displayed on the edition is passed in, so the export is
      // scoped to exactly these honorees rather than the whole nominee table.
      const ids = Array.isArray(body?.nominee_ids)
        ? body.nominee_ids.filter((id: any) => typeof id === 'string' && id).slice(0, 500)
        : [];

      const roster = ids.length
        ? await base44.asServiceRole.entities.Nominee.filter({ id: { $in: ids } }, '-claim_requested_date', 500)
        : await base44.asServiceRole.entities.Nominee.filter({ claim_status: { $ne: 'unclaimed' } }, '-claim_requested_date', 5000);

      const claims = (roster || []).filter((n: any) =>
        (n.claim_status && n.claim_status !== 'unclaimed') || n.claim_requested_by || n.claimed_by_user_id,
      );

      if (claims.length === 0) {
        return Response.json({ error: 'No claim requests on this roster yet' }, { status: 404 });
      }

      const csv = [CLAIM_HEADERS.join(','), ...claims.map(claimRow)].join('\n');
      const byStatus: Record<string, number> = {};
      claims.forEach((n: any) => {
        const key = n.claim_status || 'unrecorded';
        byStatus[key] = (byStatus[key] || 0) + 1;
      });
      return Response.json({ success: true, dataset, csv, count: claims.length, byStatus });
    }

    return Response.json({ error: "dataset must be 'waitlist' or 'claims'" }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}