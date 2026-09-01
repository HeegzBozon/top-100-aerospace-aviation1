import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { resolveOutreachPersons, personsToOutreachCsv } from '../../shared/nomineeResolve.ts';

// Admin-only: server-generate the normalized, one-row-per-person outreach CSV.
// Paginates the full Nominee pool, dedupes to persons (collapsing secondary
// emails and cross-season nominations of the same email), stamps claim
// readiness + account presence + canonical deep link, and returns the CSV text
// so the admin downloads it (no client-side 5000-record flatten).
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Load the entire nominee pool. Single bounded call consistent with the
    // existing pool size; the dedupe step is what makes this scale-safe.
    const all = await base44.entities.Nominee.list('-created_date', 5000);
    if (!all || all.length === 0) {
      return Response.json({ error: 'No nominees found' }, { status: 404 });
    }

    // Build a set of known account emails once, so "has account" is resolved
    // in one pass rather than per-person. Service role to read all users.
    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const knownUserEmails = new Set<string>();
    for (const u of users || []) {
      if (u.email) knownUserEmails.add(u.email.toLowerCase().trim());
    }

    const persons = resolveOutreachPersons(all, knownUserEmails);
    const csv = personsToOutreachCsv(persons);

    return Response.json({
      success: true,
      csv,
      count: persons.length,
      readinessBreakdown: {
        'claimable-by-email': persons.filter((p) => p.claimReadiness === 'claimable-by-email').length,
        'claimable-by-linkedin': persons.filter((p) => p.claimReadiness === 'claimable-by-linkedin').length,
        'no-contact': persons.filter((p) => p.claimReadiness === 'no-contact').length,
        'claimed': persons.filter((p) => p.claimReadiness === 'claimed').length,
      },
    });
  } catch (error) {
    console.error(`Error in exportOutreachList: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
}