import Stripe from 'npm:stripe@^14.0.0';

const STARTER_PRICE_CENTS = 9700; // $97.00 USD / month

Deno.serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    const origin = req.headers.get('origin') || 'https://top100aero.space';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'TOP 100 — Ground Control Starter',
              description:
                'The self-serve starter kit. Missed-call text-back, one pipeline, 500 texts / 5,000 emails, dashboard access, community support. Month to month — cancel anytime.',
            },
            unit_amount: STARTER_PRICE_CENTS,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}&plan=ground_control_starter`,
      cancel_url: `${origin}/ground-control`,
      metadata: {
        product: 'ground_control_starter',
        interval: 'month',
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Ground Control Starter checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});