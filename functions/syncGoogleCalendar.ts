import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { format, addMinutes } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id, action } = await req.json();
    
    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');
    
    if (!accessToken) {
      return Response.json({ error: 'Google Calendar not connected' }, { status: 400 });
    }

    if (action === 'create') {
      // Get booking details
      const bookings = await base44.entities.Booking.filter({ id: booking_id });
      const booking = bookings[0];
      
      if (!booking) {
        return Response.json({ error: 'Booking not found' }, { status: 404 });
      }

      // Get service details
      const services = await base44.entities.Service.filter({ id: booking.service_id });
      const service = services[0];

      const startTime = new Date(booking.start_time);
      const endTime = booking.end_time 
        ? new Date(booking.end_time)
        : addMinutes(startTime, service?.duration_minutes || 60);

      // Create Google Calendar event
      const event = {
        summary: `${service?.title || 'Booking'} - ${booking.client_user_email}`,
        description: `Client: ${booking.client_user_email}\n${booking.notes || ''}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: booking.meeting_link ? {
          conferenceSolution: { key: { type: 'hangoutsMeet' } },
          entryPoints: [{ entryPointType: 'video', uri: booking.meeting_link }]
        } : undefined,
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        return Response.json({ error: `Failed to create event: ${error}` }, { status: 500 });
      }

      const createdEvent = await response.json();

      // Update booking with calendar event ID
      await base44.entities.Booking.update(booking_id, {
        google_calendar_event_id: createdEvent.id,
      });

      return Response.json({ success: true, eventId: createdEvent.id });

    } else if (action === 'delete') {
      const bookings = await base44.entities.Booking.filter({ id: booking_id });
      const booking = bookings[0];

      if (booking?.google_calendar_event_id) {
        await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${booking.google_calendar_event_id}`,
          {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${accessToken}` },
          }
        );
      }

      return Response.json({ success: true });

    } else if (action === 'sync_availability') {
      // Fetch busy times from Google Calendar
      const now = new Date();
      const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/freeBusy',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timeMin: now.toISOString(),
            timeMax: twoWeeksLater.toISOString(),
            items: [{ id: 'primary' }],
          }),
        }
      );

      if (!response.ok) {
        return Response.json({ error: 'Failed to fetch availability' }, { status: 500 });
      }

      const data = await response.json();
      const busyTimes = data.calendars?.primary?.busy || [];

      return Response.json({ success: true, busyTimes });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});