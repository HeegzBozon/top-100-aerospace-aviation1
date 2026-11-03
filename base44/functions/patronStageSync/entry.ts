import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { blockersFor, STAGE_KEYS, stageLabel } from '../../shared/patronLifecycle.ts';
import { addContactNote, addContactTags, ghlStageTag } from '../../shared/ghlContact.ts';

// THE STAGE GATE.
//
// The desk never writes a stage itself. Every advance comes through here, because the gate
// is the product: a slot may not be called committed at an unapproved rate, contracted
// without the firewall and label cleared, or delivered with untested links. A refused
// advance returns the blockers in plain words and changes nothing.
//
// Three things move together on an advance: the deal, the inventory it holds, and the CRM.

export default async function (req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);

  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
  if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const dealId = String(body.deal_id || '');
  const stage = String(body.stage || '');
  const note = String(body.note || '').slice(0, 600);

  if (!dealId) return Response.json({ error: 'deal_id is required' }, { status: 400 });
  if (!STAGE_KEYS.includes(stage)) return Response.json({ error: 'Unknown stage' }, { status: 400 });

  const sr = base44.asServiceRole;
  let deal: any = null;
  try {
    deal = await sr.entities.PatronDeal.get(dealId);
  } catch {
    return Response.json({ error: 'That deal no longer exists.' }, { status: 404 });
  }

  // The one gate that needs another record: a deal is only reported once the 7-day report
  // has actually gone out.
  let hasSentReport = false;
  if (stage === 'reported') {
    const reports = await sr.entities.PatronReport.filter({ deal_id: dealId, window: '7d', status: 'sent' });
    hasSentReport = (reports || []).length > 0;
  }

  const blockers = blockersFor(deal, stage, { hasSentReport });
  if (blockers.length) {
    return Response.json({ error: 'Gate is closed', stage, blockers }, { status: 409 });
  }

  const history = [
    ...(deal.stage_history || []),
    {
      stage,
      at: new Date().toISOString(),
      by: user.email || 'desk',
      note: note || `Moved to ${stageLabel(stage)}`,
    },
  ];

  const updated = await sr.entities.PatronDeal.update(dealId, { stage, stage_history: history });

  // The inventory follows the deal, so a slot can never read as open while a Patron holds it.
  if (deal.slot_id) {
    try {
      if (stage === 'committed') {
        await sr.entities.SponsorSlot.update(deal.slot_id, {
          status: 'sold',
          patron_deal_id: dealId,
        });
      }
      if (stage === 'delivered') {
        await sr.entities.SponsorSlot.update(deal.slot_id, {
          status: 'delivered',
          patron_deal_id: dealId,
          patron_name: deal.organization_name,
        });
      }
      if (stage === 'declined') {
        await sr.entities.SponsorSlot.update(deal.slot_id, {
          status: 'open',
          patron_deal_id: '',
          patron_name: '',
        });
      }
    } catch (error) {
      console.warn('[patronStageSync] slot not moved:', error?.message);
    }
  }

  // The CRM records where the relationship stands, and why.
  if (deal.ghl_contact_id) {
    await addContactTags(deal.ghl_contact_id, [ghlStageTag(stage), 'Patron of Record']).catch(() => null);
    await addContactNote(
      deal.ghl_contact_id,
      `Stage → ${stageLabel(stage)} (${new Date().toISOString().slice(0, 10)})${note ? `\n${note}` : ''}`,
    ).catch(() => null);
  }

  return Response.json({ ok: true, deal: updated });
}