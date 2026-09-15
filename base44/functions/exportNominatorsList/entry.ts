import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { isValidEmail, csvEscape } from '../../shared/nomineeResolve.ts';

// Admin-only: server-generate the one-row-per-nominator CSV.
// Groups the full nominee pool by `nominated_by` (the nominator's email),
// counts each nominator's submissions, stamps first/last nomination date and
// whether that nominator now has an account. Sorted by nomination count desc
// so the highest-yield "past nominators" segment surfaces first for outreach.
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

    const all = await base44.entities.Nominee.list('-created_date', 5000);
    if (!all || all.length === 0) {
      return Response.json({ error: 'No nominees found' }, { status: 404 });
    }

    // Known account emails — resolved in one pass so "has account" is cheap.
    const users = await base44.asServiceRole.entities.User.list('-created_date', 5000);
    const knownUserEmails = new Set<string>();
    for (const u of users || []) {
      if (u.email) knownUserEmails.add(u.email.toLowerCase().trim());
    }

    // Group by normalized nominator email. Invalid / missing nominator emails
    // are skipped so a blank `nominated_by` never becomes a row.
    const nominators = new Map<string, {
      email: string;
      count: number;
      firstDate: string;
      lastDate: string;
      names: string[];
    }>();

    for (const n of all) {
      const raw = n.nominated_by;
      if (!isValidEmail(raw)) continue;
      const key = String(raw).toLowerCase().trim();
      const created = String(n.created_date || '');
      const existing = nominators.get(key);
      if (existing) {
        existing.count += 1;
        if (created) {
          if (!existing.firstDate || created < existing.firstDate) existing.firstDate = created;
          if (created > existing.lastDate) existing.lastDate = created;
        }
        if (n.name && existing.names.length < 5 && !existing.names.includes(n.name)) {
          existing.names.push(n.name);
        }
      } else {
        nominators.set(key, {
          email: key,
          count: 1,
          firstDate: created,
          lastDate: created,
          names: n.name ? [n.name] : [],
        });
      }
    }

    const rows = [...nominators.values()].sort((a, b) => b.count - a.count);

    const headers = [
      'Nominator Email',
      'Nomination Count',
      'First Nominated',
      'Last Nominated',
      'Has Account',
      'Recent Nominees (sample)',
    ];
    const lines = [headers.map(csvEscape).join(',')];
    for (const r of rows) {
      lines.push([
        r.email,
        r.count,
        r.firstDate,
        r.lastDate,
        knownUserEmails.has(r.email) ? 'yes' : 'no',
        r.names.join('; '),
      ].map(csvEscape).join(','));
    }
    const csv = lines.join('\n');

    return Response.json({
      success: true,
      csv,
      count: rows.length,
      totalNominations: rows.reduce((sum, r) => sum + r.count, 0),
    });
  } catch (error) {
    console.error(`Error in exportNominatorsList: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
}