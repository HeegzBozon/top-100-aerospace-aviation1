import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'https://app.base44.com';
    const amountCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      submit_type: 'donate',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'TOP 100 Archive - Donation',
              description: 'PDF, CSV & JSON exports of the 2025 Orbital Edition',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_email: user.email,
        amount_usd: amount,
        product_type: 'archive_donation',
      },
      success_url: `${origin}/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}&product=archive&amount=${amount}`,
      cancel_url: `${origin}/ArchiveLanding?canceled=true`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});