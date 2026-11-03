import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { notifyDesk, todayISO } from '../../shared/patronDesk.ts';

// THE CADENCE — nothing goes quiet.
//
// A stage is only as honest as the date beside it. This runs once a day and reports every
// live deal whose next action has come due, grouped by the seat that owes it, so a
// conversation that has stopped moving is named rather than discovered late.
//
// Test deals are never named here: a walk-through is not a pipeline.

const ACTIVE_STAGES = [
  'identified',
  'touched',
  'replied',
  'qualified',
  'pitched',
  'committed',
  'contracted',
  'paid',
  'delivered',
];

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const sr = base44.asServiceRole;
  const today = todayISO();

  const deals = (await sr.entities.PatronDeal.filter({ stage: { $in: ACTIVE_STAGES } })) || [];
  const overdue = deals.filter(
    (deal: any) => !deal.is_test && deal.next_action_due && String(deal.next_action_due) <= today,
  );

  if (!overdue.length) {
    return Response.json({ ok: true, overdue: 0, note: 'Every live deal has a future action date.' });
  }

  const byOwner = new Map<string, any[]>();
  for (const deal of overdue) {
    const owner = deal.owner_pitcher || deal.owner_qualifier || 'desk';
    byOwner.set(owner, [...(byOwner.get(owner) || []), deal]);
  }

  const lines: string[] = [`${overdue.length} deal(s) past their next action date.`, ''];
  for (const [owner, rows] of byOwner.entries()) {
    lines.push(`${owner} owes:`);
    for (const deal of rows) {
      lines.push(
        `  · ${deal.organization_name} — ${deal.stage}, due ${deal.next_action_due}: ${
          deal.next_action || 'no next action written'
        }`,
      );
    }
    lines.push('');
  }
  lines.push('Open the desk and move each one, or write down why it is waiting.');
  lines.push('https://top100aero.space/patronage/desk');

  const sentTo = await notifyDesk(sr, `Patron cadence: ${overdue.length} deal(s) past due`, lines.join('\n'));

  return Response.json({
    ok: true,
    overdue: overdue.length,
    owners: [...byOwner.keys()],
    notified: sentTo,
  });
}