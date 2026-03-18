import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@^14.0.0';

export const createCheckoutSession = async ({ bookingId }) => {
    Deno.serve(async (req) => {
        try {
            const base44 = createClientFromRequest(req);
            const user = await base44.auth.me();

            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const payload = await req.json();
            const { bookingId } = payload;

            if (!bookingId) {
                return Response.json({ error: 'Booking ID is required' }, { status: 400 });
            }

            // 1. Fetch Booking
            const bookings = await base44.entities.Booking.list({ id: bookingId }, 1);
            if (!bookings || bookings.length === 0) {
                return Response.json({ error: 'Booking not found' }, { status: 404 });
            }
            const booking = bookings[0];

            // 2. Fetch Service
            const services = await base44.entities.Service.list({ id: booking.service_id }, 1);
            if (!services || services.length === 0) {
                return Response.json({ error: 'Service not found' }, { status: 404 });
            }
            const service = services[0];

            // 3. Initialize Stripe
            const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
            const origin = req.headers.get("origin") || "https://app.base44.com"; // Fallback or dynamic

            // 4. Determine Payment Routing (Tiered Royalty System)
            // Tiers: standard=20%, verified=15%, partner=10%, sponsor=5%
            let payment_intent_data = {};
            
            // Check if provider is a community member (not platform)
            if (service.provider_type !== 'platform' && service.provider_user_email) {
                const providerProfiles = await base44.entities.Profile.filter({ user_email: service.provider_user_email }, null, 1);
                const providerProfile = providerProfiles?.[0];

                if (providerProfile?.stripe_connect_account_id && providerProfile?.stripe_payouts_enabled) {
                    const amountCents = Math.round(service.base_price * 100);
                    
                    // Get provider's tier for royalty rate
                    const providerTiers = await base44.entities.ProviderTier.filter({ provider_email: service.provider_user_email }, null, 1);
                    const providerTier = providerTiers?.[0];
                    
                    // Default rates by tier
                    const tierRates = {
                        standard: 0.20,  // 20%
                        verified: 0.15,  // 15%
                        partner: 0.10,   // 10%
                        sponsor: 0.05    // 5%
                    };
                    
                    // Use custom rate if set, otherwise use tier default
                    const royaltyRate = providerTier?.royalty_rate ?? tierRates[providerTier?.tier] ?? 0.20;
                    let platformFee = Math.round(amountCents * royaltyRate);
                    
                    // Apply royalty cap if set (e.g., for large transactions)
                    if (providerTier?.royalty_cap && platformFee > providerTier.royalty_cap) {
                        platformFee = providerTier.royalty_cap;
                    }

                    payment_intent_data = {
                        application_fee_amount: platformFee,
                        transfer_data: {
                            destination: providerProfile.stripe_connect_account_id,
                        },
                    };
                }
            }

            // 5. Create Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: service.title,
                                description: service.description,
                                images: service.image_url ? [service.image_url] : [],
                                metadata: {
                                    service_id: service.id
                                }
                            },
                            unit_amount: Math.round(service.base_price * 100), // Convert to cents
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${origin}/PaymentSuccess?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/PaymentCancel`,
                customer_email: user.email,
                client_reference_id: booking.id,
                payment_intent_data: Object.keys(payment_intent_data).length > 0 ? payment_intent_data : undefined,
                metadata: {
                    booking_id: booking.id,
                    service_id: service.id,
                    user_id: user.id
                }
            });

            return Response.json({ url: session.url });

        } catch (error) {
            console.error("Checkout Error:", error);
            return Response.json({ error: error.message }, { status: 500 });
        }
    });
};