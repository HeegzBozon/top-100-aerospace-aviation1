import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { format, subHours, isWithinInterval } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Find bookings completed 23-25 hours ago that haven't received review requests
    const now = new Date();
    const hours25Ago = subHours(now, 25);
    const hours23Ago = subHours(now, 23);
    
    const bookings = await base44.asServiceRole.entities.Booking.filter({
      status: 'completed',
    });
    
    // Filter bookings in the 23-25 hour window
    const eligibleBookings = bookings.filter(booking => {
      if (booking.review_request_sent) return false;
      const endTime = new Date(booking.end_time || booking.start_time);
      return isWithinInterval(endTime, { start: hours25Ago, end: hours23Ago });
    });
    
    const results = [];
    
    for (const booking of eligibleBookings) {
      const services = await base44.asServiceRole.entities.Service.filter({ id: booking.service_id });
      const service = services[0];
      
      if (!service) continue;
      
      // Check if review already exists
      const existingReviews = await base44.asServiceRole.entities.Review.filter({
        booking_id: booking.id,
      });
      
      if (existingReviews.length > 0) {
        await base44.asServiceRole.entities.Booking.update(booking.id, {
          review_request_sent: true,
        });
        continue;
      }
      
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: booking.client_user_email,
          subject: `How was your ${service.title} session?`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e3a5a;">We'd love your feedback!</h2>
              <p>Hi there,</p>
              <p>You recently completed a session:</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e3a5a; margin-top: 0;">${service.title}</h3>
                <p><strong>Date:</strong> ${format(new Date(booking.start_time), 'MMMM do, yyyy')}</p>
              </div>
              <p>Your review helps other community members find great services and helps providers improve.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${Deno.env.get('V1_APP_URL') || ''}/MyBookings" 
                   style="background: #1e3a5a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Leave a Review
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">Thank you for being part of our community!</p>
            </div>
          `,
        });
        
        await base44.asServiceRole.entities.Booking.update(booking.id, {
          review_request_sent: true,
        });
        
        results.push({ bookingId: booking.id, status: 'sent' });
      } catch (emailError) {
        results.push({ bookingId: booking.id, status: 'error', error: emailError.message });
      }
    }
    
    return Response.json({
      success: true,
      processed: eligibleBookings.length,
      results,
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});