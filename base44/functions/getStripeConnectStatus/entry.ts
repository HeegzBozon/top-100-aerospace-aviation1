import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@14.14.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile with Stripe Connect ID
    const profiles = await base44.entities.Profile.filter({ user_email: user.email });
    const profile = profiles[0];

    if (!profile?.stripe_connect_id) {
      return Response.json({ 
        connected: false,
        onboarded: false,
        payouts_enabled: false
      });
    }

    // Get Stripe account details
    const account = await stripe.accounts.retrieve(profile.stripe_connect_id);

    return Response.json({
      connected: true,
      account_id: account.id,
      onboarded: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      email: account.email,
      country: account.country,
      default_currency: account.default_currency,
      requirements: account.requirements
    });

  } catch (error) {
    console.error('Stripe Connect status error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});