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

    const { service_id, success_url, cancel_url } = await req.json();

    if (!service_id) {
      return Response.json({ error: 'service_id is required' }, { status: 400 });
    }

    // Verify service exists and user owns it
    const service = await base44.entities.Service.get(service_id);
    if (!service) {
      return Response.json({ error: 'Service not found' }, { status: 404 });
    }

    if (service.provider_user_email !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Featured service price: $29
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Featured Service Listing',
              description: `Feature "${service.title}" at the top of search results for 30 days`,
            },
            unit_amount: 2900, // $29.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/TalentExchange?tab=services&featured_success=true`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/TalentExchange?tab=services`,
      metadata: {
        service_id: service_id,
        user_email: user.email,
        type: 'featured_service'
      },
      customer_email: user.email,
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Featured service checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});