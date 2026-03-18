import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { format, addHours, subHours, isWithinInterval } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function should be called by a scheduled task
    // It finds bookings happening in the next 24 hours and sends reminders
    
    const now = new Date();
    const in24Hours = addHours(now, 24);
    const in23Hours = addHours(now, 23);
    
    // Get all confirmed bookings
    const bookings = await base44.asServiceRole.entities.Booking.filter({
      status: 'confirmed',
      reminder_sent: false,
    });
    
    // Filter bookings happening in the next 23-24 hour window
    const upcomingBookings = bookings.filter(booking => {
      const startTime = new Date(booking.start_time);
      return isWithinInterval(startTime, { start: in23Hours, end: in24Hours });
    });
    
    const results = [];
    
    for (const booking of upcomingBookings) {
      // Get service details
      const services = await base44.asServiceRole.entities.Service.filter({ id: booking.service_id });
      const service = services[0];
      
      if (!service) continue;
      
      const startTime = new Date(booking.start_time);
      const formattedDate = format(startTime, 'EEEE, MMMM do');
      const formattedTime = format(startTime, 'h:mm a');
      
      // Send reminder to client
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: booking.client_user_email,
          subject: `Reminder: ${service.title} tomorrow at ${formattedTime}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e3a5a;">Booking Reminder</h2>
              <p>Hi there,</p>
              <p>This is a friendly reminder about your upcoming booking:</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e3a5a; margin-top: 0;">${service.title}</h3>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Duration:</strong> ${service.duration_minutes} minutes</p>
                ${booking.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${booking.meeting_link}">${booking.meeting_link}</a></p>` : ''}
              </div>
              ${booking.notes ? `<p><strong>Your notes:</strong> ${booking.notes}</p>` : ''}
              <p>See you soon!</p>
            </div>
          `,
        });
        
        // Send reminder to provider
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: booking.provider_user_email,
          subject: `Reminder: Upcoming session - ${service.title}`,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e3a5a;">Session Reminder</h2>
              <p>Hi there,</p>
              <p>You have an upcoming session:</p>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e3a5a; margin-top: 0;">${service.title}</h3>
                <p><strong>Client:</strong> ${booking.client_user_email}</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Duration:</strong> ${service.duration_minutes} minutes</p>
              </div>
              ${booking.notes ? `<p><strong>Client notes:</strong> ${booking.notes}</p>` : ''}
            </div>
          `,
        });
        
        // Mark reminder as sent
        await base44.asServiceRole.entities.Booking.update(booking.id, {
          reminder_sent: true,
        });
        
        results.push({ bookingId: booking.id, status: 'sent' });
      } catch (emailError) {
        results.push({ bookingId: booking.id, status: 'error', error: emailError.message });
      }
    }
    
    return Response.json({
      success: true,
      processed: upcomingBookings.length,
      results,
    });
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});