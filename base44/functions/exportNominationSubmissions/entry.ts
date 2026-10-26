import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { csvEscape } from '../../shared/nomineeResolve.ts';

// Admin-only: server-generate the one-row-per-submission CSV of every
// NominationIntake record — the raw nomination responses behind the roster,
// exactly as the nominator submitted them (consent field included).
// Provenance for internal review only; never read by discovery, ranking or scoring.
const HEADERS = [
  'Submitted', 'Last Updated', 'Track', 'Review Status',
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

// One CSV row per submission, columns aligned with HEADERS.
function submissionRow(r: any): string {
  return [
    r.created_date, r.updated_date,
    TRACK_LABELS[r.nomination_type] || r.nomination_type || '',
    r.status || '',
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

    // Single bounded service-role read, consistent with the other admin exports.
    const all = await base44.asServiceRole.entities.NominationIntake.list('-created_date', 5000);
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

    return Response.json({ success: true, csv, count: all.length, byTrack, byStatus });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}