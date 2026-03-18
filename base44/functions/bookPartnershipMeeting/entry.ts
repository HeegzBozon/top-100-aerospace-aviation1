import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Auth check
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, company, date, time, duration, notes } = await req.json();

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Create calendar event
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + (duration || 60) * 60000);

    const event = {
      summary: `Partnership Meeting - ${company}`,
      description: `Partnership discussion with ${name} from ${company}\n\nEmail: ${email}\n\nNotes: ${notes || 'None'}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/New_York'
      },
      attendees: [
        { email: email }
      ],
      conferenceData: {
        createRequest: {
          requestId: `partnership-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const calendarResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      }
    );

    if (!calendarResponse.ok) {
      const error = await calendarResponse.text();
      console.error('Calendar API error:', error);
      return Response.json({ error: 'Failed to create calendar event' }, { status: 500 });
    }

    const calendarEvent = await calendarResponse.json();

    // Create PartnershipInquiry record
    await base44.asServiceRole.entities.PartnershipInquiry.create({
      company,
      name,
      email,
      role: 'Not specified',
      tier: 'Meeting booked',
      goals: [],
      timeline: `Scheduled: ${date} ${time}`,
      message: notes || '',
      status: 'contacted'
    });

    return Response.json({
      success: true,
      eventId: calendarEvent.id,
      meetLink: calendarEvent.hangoutLink
    });

  } catch (error) {
    console.error('Error booking meeting:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});