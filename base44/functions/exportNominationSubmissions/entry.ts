import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { csvEscape } from '../../shared/nomineeResolve.ts';

// Admin-only: server-generate the one-row-per-submission CSV of every
// NominationIntake record — the raw nomination responses behind the roster,
// exactly as the nominator submitted them (consent field included).
// Provenance for internal review only; never read by discovery, ranking or scoring.
const HEADERS = [
  'Submitted', 'Last Updated', 'Track', 'Review Status',
  'Nominator Attribution',
  'Nominee', 'Nominee Email', 'Role / Org', 'Firm', 'Profile Link', 'Location',
  'Reason', 'Investing In',
  'Nominator', 'Nominator Email', 'Nominator Connection', 'Share Name Consent',
  'Source', 'Admin Notes',
  'Intake ID', 'Linked Nominee ID', 'Raw Submission ID', 'Survey ID',
];

const TRACK_LABELS: Record<string, string> = {
  women: 'TOP 100 Women',
  men: 'TOP 100 Men',
  angels: 'TOP 100 Angels',
};

// Consent governs external use of a nominator's identity: only 'yes' may be
// named outside the platform. The flag travels inside the row so a file cannot
// be shared without the rule attached to it. Anything not explicitly consented
// (including a blank answer) is treated as keep-internal.
function nominatorAttribution(shareName: any): string {
  if (shareName === 'yes') return 'consented';
  if (shareName === 'no') return 'ANONYMOUS - keep internal';
  return 'NOT STATED - keep internal';
}

// One CSV row per submission, columns aligned with HEADERS.
function submissionRow(r: any): string {
  return [
    r.created_date, r.updated_date,
    TRACK_LABELS[r.nomination_type] || r.nomination_type || '',
    r.status || '',
    nominatorAttribution(r.share_name),
    r.nominee_name, r.nominee_email, r.role_org, r.firm, r.link, r.location,
    r.reason, r.investing_in,
    r.nominator_name, r.nominator_email, r.nominator_connection, r.share_name,
    r.source, r.admin_notes,
    r.id, r.nominee_id, r.submission_id, r.survey_id,
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
    const nominationType = typeof body?.nomination_type === 'string' ? body.nomination_type : null;

    // Single bounded service-role read, consistent with the other admin exports.
    // An optional track filter lets a caller export one roster's submissions.
    const all = nominationType
      ? await base44.asServiceRole.entities.NominationIntake.filter({ nomination_type: nominationType }, '-created_date', 5000)
      : await base44.asServiceRole.entities.NominationIntake.list('-created_date', 5000);
    if (!all || all.length === 0) {
      return Response.json({ error: 'No nomination submissions found' }, { status: 404 });
    }

    const csv = [HEADERS.join(','), ...all.map(submissionRow)].join('\n');

    const byTrack: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const r of all) {
      const track = TRACK_LABELS[r.nomination_type] || 'Unknown';
      byTrack[track] = (byTrack[track] || 0) + 1;
      const status = r.status || 'unknown';
      byStatus[status] = (byStatus[status] || 0) + 1;
    }

    // Surfaces how many rows carry an identity rule at export time.
    const anonymous = all.filter((r: any) => r.share_name !== 'yes').length;

    return Response.json({ success: true, csv, count: all.length, anonymous, byTrack, byStatus });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}