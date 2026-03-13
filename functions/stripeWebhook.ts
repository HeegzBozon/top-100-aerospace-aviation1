import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@^14.0.0';

export const stripeWebhook = async () => {
    Deno.serve(async (req) => {
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            return Response.json({ error: 'Missing stripe-signature header' }, { status: 400 });
        }

        const body = await req.text();
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
        const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET'); // Optional: Verify if secret is set

        let event;

        try {
            // If endpointSecret is set, verify signature. Otherwise, proceed (dev mode/less secure)
            // Strongly recommended to set STRIPE_WEBHOOK_SECRET in production
             if (endpointSecret) {
                event = await stripe.webhooks.constructEventAsync(
                    body,
                    signature,
                    endpointSecret
                );
            } else {
                event = JSON.parse(body);
            }
        } catch (err) {
            console.error(`Webhook signature verification failed.`, err.message);
            return Response.json({ error: 'Webhook signature verification failed' }, { status: 400 });
        }

        const base44 = createClientFromRequest(req);

        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object;
                    const metadata = session.metadata || {};
                    const bookingId = session.client_reference_id;
                    const paymentIntentId = session.payment_intent;
                    const amountTotal = session.amount_total; // cents

                    // Handle Featured Job purchase
                    if (metadata.type === 'featured_job' && metadata.job_id) {
                        await base44.asServiceRole.entities.Job.update(metadata.job_id, {
                            featured: true
                        });
                        console.log(`Job ${metadata.job_id} marked as featured`);
                    }

                    // Handle Featured Service purchase
                    if (metadata.type === 'featured_service' && metadata.service_id) {
                        const featuredUntil = new Date();
                        featuredUntil.setDate(featuredUntil.getDate() + 30);
                        
                        await base44.asServiceRole.entities.Service.update(metadata.service_id, {
                            is_featured: true,
                            featured_until: featuredUntil.toISOString()
                        });
                        console.log(`Service ${metadata.service_id} featured until ${featuredUntil}`);
                    }

                    // Handle Booking payment (existing logic)
                    if (bookingId) {
                        // 1. Update Booking
                        await base44.asServiceRole.entities.Booking.update(bookingId, {
                            payment_status: 'paid',
                            status: 'confirmed' // Ensure it's confirmed
                        });

                        // 2. Create Payment Record
                        await base44.asServiceRole.entities.Payment.create({
                            booking_id: bookingId,
                            payer_email: session.customer_email || session.customer_details?.email,
                            amount_cents: amountTotal,
                            currency: session.currency,
                            stripe_payment_intent_id: typeof paymentIntentId === 'string' ? paymentIntentId : null,
                            status: 'succeeded',
                            platform_fee_cents: 0,
                            provider_amount_cents: amountTotal,
                            commission_rate: 0
                        });
                        
                        console.log(`Payment recorded for booking ${bookingId}`);
                    }
                    break;
                }
                // Handle other event types if needed
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            return Response.json({ received: true });

        } catch (err) {
            console.error(`Error processing webhook: ${err.message}`);
            return Response.json({ error: 'Error processing webhook' }, { status: 500 });
        }
    });
};