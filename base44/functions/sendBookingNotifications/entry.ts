import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { type, bookingId, customMessage } = await req.json();

    // Fetch booking
    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: bookingId });
    if (!bookings.length) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }
    const booking = bookings[0];

    // Fetch service details
    const services = await base44.asServiceRole.entities.Service.filter({ id: booking.service_id });
    const service = services[0];

    const startTime = new Date(booking.start_time);
    const formattedDate = startTime.toLocaleDateString('en-US', { 
      weekday: 'long', month: 'long', day: 'numeric' 
    });
    const formattedTime = startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', minute: '2-digit' 
    });

    let subject, body, recipient;

    switch (type) {
      case 'confirmation':
        recipient = booking.client_user_email;
        subject = `Booking Confirmed: ${service?.title || 'Service'}`;
        body = `
Your booking has been confirmed!

Service: ${service?.title}
Date: ${formattedDate}
Time: ${formattedTime}
${booking.meeting_link ? `\nMeeting Link: ${booking.meeting_link}` : ''}

If you need to reschedule or cancel, please do so at least 24 hours in advance for a full refund.

Thank you for booking with us!
        `;
        break;

      case 'reminder':
        recipient = booking.client_user_email;
        subject = `Reminder: Your session is coming up - ${service?.title}`;
        body = `
Don't forget! Your session is scheduled for:

Service: ${service?.title}
Date: ${formattedDate}
Time: ${formattedTime}
${booking.meeting_link ? `\nMeeting Link: ${booking.meeting_link}` : ''}

We look forward to seeing you!
        `;
        break;

      case 'provider_new_booking':
        recipient = booking.provider_user_email;
        subject = `New Booking: ${service?.title}`;
        body = `
You have a new booking!

Service: ${service?.title}
Client: ${booking.client_user_email}
Date: ${formattedDate}
Time: ${formattedTime}
${booking.notes ? `\nClient Notes: ${booking.notes}` : ''}

Please make sure to be available at the scheduled time.
        `;
        break;

      case 'cancellation':
        recipient = booking.provider_user_email;
        subject = `Booking Cancelled: ${service?.title}`;
        body = `
A booking has been cancelled.

Service: ${service?.title}
Original Date: ${formattedDate}
Time: ${formattedTime}
${booking.cancellation_reason ? `\nReason: ${booking.cancellation_reason}` : ''}
        `;
        break;

      case 'waitlist_available':
        // recipient should be passed in customMessage as email
        recipient = customMessage?.email;
        subject = `Spot Available: ${service?.title}`;
        body = `
Good news! A spot has opened up for ${service?.title}.

Book now before it's taken!
        `;
        break;

      default:
        return Response.json({ error: 'Unknown notification type' }, { status: 400 });
    }

    // Send email
    await base44.integrations.Core.SendEmail({
      to: recipient,
      subject,
      body: body.trim()
    });

    return Response.json({ success: true, sent_to: recipient });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});