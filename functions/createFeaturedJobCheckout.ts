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

    const { job_id, success_url, cancel_url } = await req.json();

    if (!job_id) {
      return Response.json({ error: 'job_id is required' }, { status: 400 });
    }

    // Verify job exists and user owns it
    const job = await base44.entities.Job.get(job_id);
    if (!job) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    // Featured listing price: $49
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Featured Job Listing',
              description: `Feature "${job.title}" at the top of search results for 30 days`,
            },
            unit_amount: 4900, // $49.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${req.headers.get('origin')}/TalentExchange?tab=jobs&featured_success=true`,
      cancel_url: cancel_url || `${req.headers.get('origin')}/TalentExchange?tab=jobs`,
      metadata: {
        job_id: job_id,
        user_email: user.email,
        type: 'featured_job'
      },
      customer_email: user.email,
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Featured job checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});