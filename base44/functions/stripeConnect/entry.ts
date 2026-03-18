import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@^14.0.0';

Deno.serve(async (req) => {
        try {
            const base44 = createClientFromRequest(req);
            const user = await base44.auth.me();

            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
            const payload = await req.json();
            const { action } = payload;
            const origin = req.headers.get("origin") || "https://app.base44.com";

            // Fetch user's profile to check for existing account
            const profiles = await base44.entities.Profile.list({ user_email: user.email }, 1);
            if (!profiles || profiles.length === 0) {
                return Response.json({ error: 'Profile not found. Please create a profile first.' }, { status: 404 });
            }
            const profile = profiles[0];

            if (action === 'onboard') {
                let accountId = profile.stripe_connect_account_id;

                // Create account if it doesn't exist
                if (!accountId) {
                    const account = await stripe.accounts.create({
                        type: 'express',
                        email: user.email,
                        capabilities: {
                            card_payments: { requested: true },
                            transfers: { requested: true },
                        },
                        business_type: 'individual',
                        business_profile: {
                            url: origin, // or profile url
                        }
                    });
                    accountId = account.id;
                    
                    // Save ID immediately
                    await base44.entities.Profile.update(profile.id, {
                        stripe_connect_account_id: accountId
                    });
                }

                // Create Account Link for onboarding
                const accountLink = await stripe.accountLinks.create({
                    account: accountId,
                    refresh_url: `${origin}/PayoutSettings`,
                    return_url: `${origin}/PayoutSettings?setup=complete`,
                    type: 'account_onboarding',
                });

                return Response.json({ url: accountLink.url });
            } 

            else if (action === 'check_status') {
                if (!profile.stripe_connect_account_id) return Response.json({ enabled: false });

                const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);
                const isEnabled = account.payouts_enabled && account.charges_enabled && account.details_submitted;

                if (isEnabled !== profile.stripe_payouts_enabled) {
                    await base44.entities.Profile.update(profile.id, { stripe_payouts_enabled: isEnabled });
                }

                return Response.json({ enabled: isEnabled });
            }
            
            else if (action === 'dashboard') {
                if (!profile.stripe_connect_account_id) {
                    return Response.json({ error: 'No payout account found' }, { status: 400 });
                }

                const loginLink = await stripe.accounts.createLoginLink(
                    profile.stripe_connect_account_id
                );

                return Response.json({ url: loginLink.url });
            }

            return Response.json({ error: 'Invalid action' }, { status: 400 });

            } catch (error) {
            console.error("Stripe Connect Error:", error);
            return Response.json({ error: error.message }, { status: 500 });
            }
            });