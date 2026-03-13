import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    // Helper function to add minutes to a date
    const addMinutes = (date, minutes) => {
        return new Date(date.getTime() + minutes * 60000);
    };
        try {
            const base44 = createClientFromRequest(req);
            const user = await base44.auth.me();

            if (!user) {
                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const payload = await req.json();
            const { serviceId, startTime, notes } = payload;

            // 1. Fetch Service Details
            const services = await base44.entities.Service.list({ id: serviceId }, 1);
            if (!services || services.length === 0) {
                return Response.json({ error: 'Service not found' }, { status: 404 });
            }
            const service = services[0];

            // 2. Calculate End Time
            const start = new Date(startTime);
            const end = addMinutes(start, service.duration_minutes || 60);

            // 3. Google Calendar Integration
            let googleEventId = null;
            let meetingLink = null;

            try {
                // Get Access Token using App Connector
                const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");

                if (accessToken) {
                    const eventData = {
                        summary: `Service Booking: ${service.title}`,
                        description: `Client: ${user.full_name} (${user.email})\nService: ${service.title}\nNotes: ${notes || 'None'}`,
                        start: { dateTime: start.toISOString() },
                        end: { dateTime: end.toISOString() },
                        attendees: [
                            { email: user.email },
                            { email: service.provider_user_email } // Notify provider
                        ],
                        conferenceData: {
                            createRequest: { requestId: Math.random().toString(36).substring(7) }
                        }
                    };

                    const gcalResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(eventData)
                    });

                    if (gcalResponse.ok) {
                        const event = await gcalResponse.json();
                        googleEventId = event.id;
                        meetingLink = event.hangoutLink || event.htmlLink;
                    } else {
                        console.error("GCal Error:", await gcalResponse.text());
                    }
                }
            } catch (err) {
                console.error("Failed to create Google Calendar event:", err);
                // Continue booking creation even if calendar sync fails
            }

            // 4. Create Booking Record
            const bookingData = {
                service_id: serviceId,
                client_user_email: user.email,
                provider_user_email: service.provider_user_email,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                status: 'confirmed', // Auto-confirm for now, or 'pending' based on workflow
                payment_status: 'unpaid', // Integration with Stripe would go here
                google_calendar_event_id: googleEventId,
                meeting_link: meetingLink,
                notes: notes
            };

            const newBooking = await base44.entities.Booking.create(bookingData);

            return Response.json({ success: true, booking: newBooking });

        } catch (error) {
            return Response.json({ error: error.message }, { status: 500 });
    }
});