import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { secrets } from 'base44:runtime';

// Payment fulfilment. Stripe calls this endpoint; nobody else may complete an order.
//
// The payload is never trusted on its own: the session it names is re-read from Stripe
// with the app's own key, and only a session Stripe reports as paid is fulfilled. A forged
// POST therefore cannot mark anything paid, and no webhook signing secret has to be kept.
export default async function (req) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let event;
  try {
    event = JSON.parse(await req.text());
  } catch {
    return Response.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const type = event?.type;
  const notified = event?.data?.object;
  if (!type || !notified?.id) {
    return Response.json({ error: 'Missing event type or session' }, { status: 400 });
  }
  if (!type.startsWith('checkout.session.')) {
    return Response.json({ received: true, ignored: true });
  }

  const base44 = createClientFromRequest(req);
  const stripeKey = secrets.get('STRIPE_SECRET_KEY');
  if (!stripeKey) {
    return Response.json({ error: 'Payment provider is not configured' }, { status: 500 });
  }

  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${notified.id}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      return Response.json({ error: 'Could not verify session with Stripe' }, { status: 502 });
    }
    const session = await res.json();

    const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
    if (!paid) {
      return Response.json({ received: true, paid: false });
    }

    // One order, one payment record: Stripe retries, and a retry must not double-count.
    const already = await base44.asServiceRole.entities.Payment.filter(
      { stripe_session_id: session.id },
      { limit: 1 }
    );
    if (already?.items?.length) {
      return Response.json({ received: true, duplicate: true });
    }

    const metadata = session.metadata || {};
    const bookingId = session.client_reference_id || metadata.booking_id || null;
    const product =
      metadata.product ||
      metadata.product_type ||
      metadata.plan_id ||
      metadata.type ||
      metadata.tier ||
      (bookingId ? 'booking' : 'purchase');

    if (bookingId) {
      await base44.asServiceRole.entities.Booking.update(bookingId, {
        payment_status: 'paid',
        status: 'confirmed',
      });
    }

    if (metadata.type === 'featured_job' && metadata.job_id) {
      await base44.asServiceRole.entities.Job.update(metadata.job_id, { featured: true });
    }

    if (metadata.type === 'featured_service' && metadata.service_id) {
      const until = new Date();
      until.setDate(until.getDate() + 30);
      await base44.asServiceRole.entities.Service.update(metadata.service_id, {
        is_featured: true,
        featured_until: until.toISOString(),
      });
    }

    const payment = {
      product,
      payer_email: session.customer_details?.email || session.customer_email || metadata.user_email || metadata.email,
      amount_cents: session.amount_total || 0,
      currency: session.currency || 'usd',
      stripe_session_id: session.id,
      status: 'succeeded',
      platform_fee_cents: 0,
      provider_amount_cents: session.amount_total || 0,
      commission_rate: 0,
    };
    if (bookingId) payment.booking_id = bookingId;
    if (typeof session.payment_intent === 'string') {
      payment.stripe_payment_intent_id = session.payment_intent;
    }

    await base44.asServiceRole.entities.Payment.create(payment);

    return Response.json({ received: true, product });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}