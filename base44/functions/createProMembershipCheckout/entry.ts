import Stripe from 'npm:stripe@^14.0.0';

const PRO_PRICE_CENTS = 10000; // $100.00 USD

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
              name: 'TOP 100 — Pro Membership',
              description:
                'Annual Pro membership. Search the verified network, direct messaging to Fellows, season briefings, archive access, and Phoenix Project proposal rights.',
            },
            unit_amount: PRO_PRICE_CENTS,
            recurring: { interval: 'year' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}&plan=pro`,
      cancel_url: `${origin}/Membership`,
      metadata: {
        product: 'pro_membership',
        interval: 'year',
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Pro membership checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});