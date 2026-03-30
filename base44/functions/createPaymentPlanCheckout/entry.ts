import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@^14.0.0';

const PLANS = {
  plan_a: {
    label: 'Option A — 3 Payments (Simpler, faster payoff)',
    deposit: 350,
  },
  plan_b: {
    label: 'Option B — 4 Payments (Easier on cash flow)',
    deposit: 350,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId || !PLANS[planId]) {
      return Response.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    const plan = PLANS[planId];
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const origin = req.headers.get('origin') || 'https://top100aero.space';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `TOP 100 — ${plan.label}`,
              description: `Deposit payment. Remaining installments will be invoiced per the agreed schedule.`,
            },
            unit_amount: plan.deposit * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${origin}/payment-plan`,
      customer_email: user.email,
      metadata: {
        plan_id: planId,
        plan_label: plan.label,
        user_email: user.email,
        payment_type: 'deposit',
      },
    });

    return Response.json({ url: session.url });

  } catch (error) {
    console.error('Payment plan checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});