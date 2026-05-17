import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const PRICES = {
  report: 4900,        // $49.00
  report_mentor: 14900, // $149.00
};

const LABELS = {
  report: 'Flight Debrief — AI Coaching Report',
  report_mentor: 'Flight Debrief + Fellow Mentor Call',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { tier, email, name, classification, campaignId, stats, choices, bossRoll } = body;

    if (!PRICES[tier]) {
      return Response.json({ error: 'Invalid tier' }, { status: 400 });
    }

    const appUrl = Deno.env.get('V1_APP_URL') || 'https://top100aero.space';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: PRICES[tier],
            product_data: {
              name: LABELS[tier],
              description: `Flight Profile: ${classification} · Campaign: ${campaignId}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier,
        email,
        name: name || '',
        classification,
        campaign_id: campaignId,
        stats: JSON.stringify(stats),
        choices: JSON.stringify((choices || []).slice(-8)),
        boss_roll: JSON.stringify(bossRoll || {}),
      },
      success_url: `${appUrl}/play?debrief=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/play`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});