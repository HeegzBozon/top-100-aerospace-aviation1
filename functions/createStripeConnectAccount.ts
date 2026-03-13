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

    const payload = await req.json();
    const { return_url, refresh_url } = payload;

    // Check if user already has a Stripe Connect account
    const profiles = await base44.entities.Profile.filter({ user_email: user.email });
    let profile = profiles[0];

    if (profile?.stripe_connect_id) {
      // Create login link for existing account
      const loginLink = await stripe.accounts.createLoginLink(profile.stripe_connect_id);
      return Response.json({ 
        type: 'login_link',
        url: loginLink.url 
      });
    }

    // Create new Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: {
        user_email: user.email,
        platform: 'top100_talent_exchange'
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Save Stripe Connect ID to profile
    if (profile) {
      await base44.entities.Profile.update(profile.id, {
        stripe_connect_id: account.id
      });
    } else {
      await base44.entities.Profile.create({
        user_email: user.email,
        stripe_connect_id: account.id
      });
    }

    // Create account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refresh_url || `${Deno.env.get("V1_APP_URL")}/PayoutSettings`,
      return_url: return_url || `${Deno.env.get("V1_APP_URL")}/PayoutSettings?onboarded=true`,
      type: 'account_onboarding',
    });

    return Response.json({ 
      type: 'onboarding_link',
      url: accountLink.url,
      account_id: account.id
    });

  } catch (error) {
    console.error('Stripe Connect error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});