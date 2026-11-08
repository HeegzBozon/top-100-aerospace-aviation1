import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import Stripe from 'npm:stripe@14.0.0';
import { isEmailShaped, normalizeEmail } from '../../shared/patronLifecycle.ts';

// THE SPONSOR LOUNGE — THE PAYMENT AT THE END OF THE INTERVIEW.
//
// A sponsor is walked through four questions in the Networking Lounge and arrives here with
// a tier. Two rules hold this endpoint together:
//
// 1. The price is resolved on the server, from the published card. A client never sends an
//    amount, so a rate cannot be talked down in a request.
// 2. The interview travels with the order. The deal record is written with every answer, so
//    the desk replies to a known prospect rather than to a blank line.
//
// The purchase is attribution: a labelled slot, a post, a Volume credit. Nothing here
// touches the index, the measurement, or who is featured.

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

// The published card, server-side. A tier is only sold from here.
const CARD = {
  founding: { rate: 1200, name: 'TOP 100 — Founding slot', detail: 'Issue #44, December 1. Founding rate.' },
  standard: { rate: 1500, name: 'TOP 100 — Standard issue slot', detail: 'One standard slot in a 2027 issue.' },
  flagship: { rate: 5000, name: 'TOP 100 — December 31 flagship', detail: 'The flagship: the annual issue and the Volume.' },
  annual: { rate: 3500, name: 'TOP 100 — 2027 annual anchor', detail: 'Credited across a full 2027 cycle. Rate from $3,500.' },
};

const trim = (value: string, max = 400) => String(value || '').trim().slice(0, max);

export default async function (req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Use POST' }, { status: 405 });
  }

  const body = await req.json().catch(() => ({}));
  const tier = trim(body.tier, 40);
  const card = CARD[tier];

  if (!card) {
    return Response.json({ error: 'That is not a slot we sell.' }, { status: 400 });
  }

  const organization_name = trim(body.organization_name, 160);
  const contact_name = trim(body.contact_name, 120);
  const contact_email = normalizeEmail(body.contact_email);
  const contact_role = trim(body.contact_role, 120);
  const source_detail = trim(body.source_detail, 160) || 'Sponsor Lounge';
  const answers = Array.isArray(body.answers) ? body.answers.slice(0, 8) : [];

  if (!organization_name || !contact_name) {
    return Response.json({ error: 'An organization and a name are needed.' }, { status: 400 });
  }
  if (!isEmailShaped(contact_email)) {
    return Response.json({ error: 'That address does not look like an email.' }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);
  const sr = base44.asServiceRole;

  const interview = answers
    .map((row: any) => `${trim(row?.ask, 160)} ${trim(row?.answer, 120)}`.trim())
    .filter(Boolean)
    .join('\n');

  const notes = [
    `Paid from the Sponsor Lounge (${source_detail}).`,
    `Tier: ${tier} at ${card.rate} USD.`,
    interview ? `The interview:\n${interview}` : '',
    `Their words: ${trim(body.message, 1200)}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  // One person, one live deal: a second checkout by the same address joins the record.
  const existing = await sr.entities.PatronDeal.filter({ contact_email });
  const live = (existing || []).find((deal: any) => !['declined', 'renewed'].includes(deal.stage));

  const dealPayload = {
    organization_name,
    contact_name,
    contact_email,
    contact_role,
    source: 'media_kit',
    source_detail,
    fit_category: live?.fit_category || 'other',
    consent_basis: `Bought a ${tier} slot in the Sponsor Lounge, ${new Date().toISOString().slice(0, 10)}. Asked to be invoiced and printed.`,
    stage: 'committed',
    owner_qualifier: 'Erwin',
    owner_pitcher: 'Matthew',
    notes,
    next_action: 'Send the agreement with the receipt, then approve the placement.',
  };

  const deal = live
    ? await sr.entities.PatronDeal.update(live.id, {
        ...dealPayload,
        notes: [live.notes, notes].filter(Boolean).join('\n\n---\n\n'),
        stage_history: [
          ...(Array.isArray(live.stage_history) ? live.stage_history : []),
          { stage: 'committed', at: new Date().toISOString(), by: 'sponsor lounge', note: `${tier} at ${card.rate}` },
        ],
      })
    : await sr.entities.PatronDeal.create({
        ...dealPayload,
        ghl_sync_state: 'pending',
        stage_history: [
          { stage: 'identified', at: new Date().toISOString(), by: 'sponsor lounge', note: source_detail },
          { stage: 'committed', at: new Date().toISOString(), by: 'sponsor lounge', note: `${tier} at ${card.rate}` },
        ],
      });

  const origin = req.headers.get('origin') || 'https://top100aerospaceandaviation.base44.app';
  const room = `${origin}/Colony?room=networking-lounge`;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: contact_email,
    client_reference_id: deal.id,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: card.name, description: card.detail },
          unit_amount: card.rate * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      product: 'sponsor_slot',
      tier,
      deal_id: deal.id,
      organization: organization_name,
      email: contact_email,
      amount_usd: String(card.rate),
    },
    success_url: `${room}&paid=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${room}&canceled=1`,
  });

  return Response.json({ url: session.url, session_id: session.id, deal_id: deal.id, rate: card.rate });
}