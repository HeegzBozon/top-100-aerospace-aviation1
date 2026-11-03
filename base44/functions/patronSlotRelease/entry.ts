import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { todayISO } from '../../shared/patronDesk.ts';

// THE SLOT THAT COMES BACK.
//
// A slot held for a conversation that never closed is inventory nobody can buy. Once the
// ad close has passed and no deal is attached to the slot, the hold is lifted and the
// inventory returns to the card.
//
// A slot with a deal on it is never touched here, whatever the date: only a person empties
// a live hold.

const HOLDS = ['held'];

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const sr = base44.asServiceRole;
  const today = todayISO();

  const slots = (await sr.entities.SponsorSlot.filter({})) || [];
  const released: any[] = [];

  for (const slot of slots) {
    if (!slot.ad_close_date || String(slot.ad_close_date) >= today) continue;
    if (!HOLDS.includes(slot.status)) continue;
    if (slot.patron_deal_id) continue;

    await sr.entities.SponsorSlot.update(slot.id, { status: 'open' });
    released.push({ id: slot.id, issue_number: slot.issue_number ?? null, ad_close_date: slot.ad_close_date });
  }

  return Response.json({ ok: true, released: released.length, slots: released });
}