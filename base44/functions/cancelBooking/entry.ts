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

    const { bookingId, reason } = await req.json();

    // Fetch booking
    const bookings = await base44.entities.Booking.filter({ id: bookingId });
    if (!bookings.length) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    const booking = bookings[0];

    // Verify user is client or provider
    if (booking.client_user_email !== user.email && booking.provider_user_email !== user.email) {
      return Response.json({ error: 'Not authorized to cancel this booking' }, { status: 403 });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return Response.json({ error: 'Booking already cancelled' }, { status: 400 });
    }

    // Calculate refund eligibility (24+ hours before = full refund, else 50%)
    const startTime = new Date(booking.start_time);
    const now = new Date();
    const hoursUntil = (startTime - now) / (1000 * 60 * 60);
    
    let refundPercent = 0;
    if (hoursUntil >= 24) {
      refundPercent = 100;
    } else if (hoursUntil >= 2) {
      refundPercent = 50;
    }

    // Process refund if payment was made
    let refundId = null;
    if (booking.payment_status === 'paid' && refundPercent > 0) {
      const payments = await base44.asServiceRole.entities.Payment.filter({ booking_id: bookingId });
      const payment = payments.find(p => p.status === 'succeeded');
      
      if (payment?.stripe_payment_intent_id) {
        const refundAmount = Math.round((payment.amount_cents * refundPercent) / 100);
        const refund = await stripe.refunds.create({
          payment_intent: payment.stripe_payment_intent_id,
          amount: refundAmount
        });
        refundId = refund.id;

        // Update payment status
        await base44.asServiceRole.entities.Payment.update(payment.id, {
          status: 'refunded',
          refund_amount_cents: refundAmount,
          refund_id: refundId
        });
      }
    }

    // Cancel Google Calendar event if exists
    if (booking.google_calendar_event_id) {
      try {
        const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");
        if (accessToken) {
          await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${booking.google_calendar_event_id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
        }
      } catch (e) {
        console.error('Failed to delete calendar event:', e);
      }
    }

    // Update booking status
    await base44.entities.Booking.update(bookingId, {
      status: 'cancelled',
      payment_status: refundPercent > 0 ? 'refunded' : booking.payment_status,
      cancellation_reason: reason,
      cancelled_by: user.email,
      cancelled_at: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      refund_percent: refundPercent,
      refund_id: refundId
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});