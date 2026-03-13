import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider_email, date, duration_minutes = 60 } = await req.json();

    if (!provider_email || !date) {
      return Response.json({ error: 'provider_email and date are required' }, { status: 400 });
    }

    // Get provider's profile for availability settings
    const profiles = await base44.asServiceRole.entities.Profile.filter({ user_email: provider_email });
    const profile = profiles[0];

    const settings = profile?.availability_settings || {
      slot_interval_minutes: 15,
      buffer_minutes: 0,
      max_days_advance: 60,
      min_notice_hours: 2,
      weekly_hours: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' }
      }
    };

    // Parse the requested date
    const requestedDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[requestedDate.getDay()];

    // Check if provider works on this day
    const dayHours = settings.weekly_hours?.[dayName];
    if (!dayHours) {
      return Response.json({ available_slots: [], message: 'Provider not available on this day' });
    }

    // Get existing bookings for this provider on this date
    const dateStart = new Date(requestedDate);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(requestedDate);
    dateEnd.setHours(23, 59, 59, 999);

    const existingBookings = await base44.asServiceRole.entities.Booking.filter({
      provider_user_email: provider_email,
      status: { $in: ['pending', 'confirmed'] }
    });

    // Filter bookings for this specific date
    const dayBookings = existingBookings.filter(b => {
      const bookingDate = new Date(b.start_time);
      return bookingDate >= dateStart && bookingDate <= dateEnd;
    });

    // Try to get Google Calendar busy times
    let calendarBusyTimes = [];
    try {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlecalendar");
      if (accessToken) {
        const calendarId = profile?.google_calendar_id || 'primary';
        const freeBusyResponse = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            timeMin: dateStart.toISOString(),
            timeMax: dateEnd.toISOString(),
            items: [{ id: calendarId }]
          })
        });

        if (freeBusyResponse.ok) {
          const freeBusyData = await freeBusyResponse.json();
          calendarBusyTimes = freeBusyData.calendars?.[calendarId]?.busy || [];
        }
      }
    } catch (calError) {
      console.log('Calendar check skipped:', calError.message);
    }

    // Generate available time slots
    const [startHour, startMin] = dayHours.start.split(':').map(Number);
    const [endHour, endMin] = dayHours.end.split(':').map(Number);

    const slots = [];
    const slotInterval = settings.slot_interval_minutes || 15;
    const buffer = settings.buffer_minutes || 0;
    const minNotice = settings.min_notice_hours || 2;

    const now = new Date();
    const minStartTime = new Date(now.getTime() + minNotice * 60 * 60 * 1000);

    let currentSlot = new Date(requestedDate);
    currentSlot.setHours(startHour, startMin, 0, 0);

    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(endHour, endMin, 0, 0);

    while (currentSlot < dayEnd) {
      const slotEnd = new Date(currentSlot.getTime() + duration_minutes * 60 * 1000);
      
      // Check if slot is in the future with minimum notice
      if (currentSlot >= minStartTime) {
        // Check against existing bookings
        const hasBookingConflict = dayBookings.some(b => {
          const bookingStart = new Date(b.start_time);
          const bookingEnd = new Date(b.end_time || bookingStart.getTime() + 60 * 60 * 1000);
          const bufferedStart = new Date(bookingStart.getTime() - buffer * 60 * 1000);
          const bufferedEnd = new Date(bookingEnd.getTime() + buffer * 60 * 1000);
          return currentSlot < bufferedEnd && slotEnd > bufferedStart;
        });

        // Check against Google Calendar busy times
        const hasCalendarConflict = calendarBusyTimes.some(busy => {
          const busyStart = new Date(busy.start);
          const busyEnd = new Date(busy.end);
          return currentSlot < busyEnd && slotEnd > busyStart;
        });

        if (!hasBookingConflict && !hasCalendarConflict && slotEnd <= dayEnd) {
          slots.push({
            start: currentSlot.toISOString(),
            end: slotEnd.toISOString(),
            display: currentSlot.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          });
        }
      }

      currentSlot = new Date(currentSlot.getTime() + slotInterval * 60 * 1000);
    }

    return Response.json({ 
      available_slots: slots,
      settings: {
        slot_interval_minutes: slotInterval,
        buffer_minutes: buffer
      }
    });

  } catch (error) {
    console.error('Availability check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});