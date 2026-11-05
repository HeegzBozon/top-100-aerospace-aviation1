import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { readLedgers, resolveRules, mailableRows } from '../../shared/audience.ts';

// THE HOUSE'S FIRST SMART LISTS, laid down in one pass.
//
// A segment is a saved question, never a saved list of people: everything here is expressed
// in the six rules the shared resolver understands, so a list stays true as the audience
// changes and nobody is ever copied out of the ledger to make one.
//
// Safe to run more than once. A segment that already exists (matched by name, case aside)
// is left exactly as it is: this lays down the house's set, it never overwrites an edit.
//
// Admin only. Every name here carries the GoHighLevel tag it matches, because the CRM is the
// system of record for contacts and the desk and the CRM must name the same audience.

const SEGMENTS = [
  {
    name: 'Everyone reachable',
    description: 'Every address the house may write to, members and readers together.',
    ghl_tag: 'SmartList: Everyone reachable',
    rules: [],
  },
  {
    name: 'New arrivals · 30 days',
    description: 'People who joined the record or the Dispatch in the last month.',
    ghl_tag: 'SmartList: New arrivals 30d',
    rules: [{ field: 'joined_within_days', value: '30' }],
  },
  {
    name: 'Readers, not members',
    description: 'They joined the Dispatch but hold no record — the warmest audience to invite in.',
    ghl_tag: 'SmartList: Readers not members',
    rules: [
      { field: 'source', value: 'subscriber' },
      { field: 'has_account', value: 'no' },
    ],
  },
  {
    name: 'Met the Dispatch on a profile',
    description: 'Readers who joined at the foot of a public record — the highest-intent door.',
    ghl_tag: 'SmartList: Profile readers',
    rules: [
      { field: 'source', value: 'subscriber' },
      { field: 'entry_point', value: 'profile' },
    ],
  },
  {
    name: 'Members of the record',
    description: 'Everyone who holds a record in the house.',
    ghl_tag: 'SmartList: Members',
    rules: [{ field: 'source', value: 'member' }],
  },
  {
    name: 'The house team',
    description: 'Admins only — for proofing an issue before it is addressed to anyone.',
    ghl_tag: 'SmartList: House team',
    rules: [{ field: 'role', value: 'admin' }],
  },
];

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth
      .me()
      .catch((e: any) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await base44.asServiceRole.entities.AudienceSegment.list({ limit: 200 });
    const taken = new Set(
      (existing?.items || []).map((row: any) => String(row.name || '').trim().toLowerCase()),
    );

    // One reading of the ledger, so every count laid down is the count the desk will show.
    const audience = await readLedgers(base44);
    const stamp = new Date().toISOString();

    const created: any[] = [];
    const skipped: string[] = [];

    for (const segment of SEGMENTS) {
      if (taken.has(segment.name.toLowerCase())) {
        skipped.push(segment.name);
        continue;
      }
      const count = mailableRows(resolveRules(audience, segment.rules)).length;
      const row = await base44.asServiceRole.entities.AudienceSegment.create({
        ...segment,
        active: true,
        last_count: count,
        last_resolved_at: stamp,
      });
      created.push({ name: row.name, count });
    }

    return Response.json({ ok: true, created, skipped });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}