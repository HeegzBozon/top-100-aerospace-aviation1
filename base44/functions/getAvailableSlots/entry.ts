import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = await req.json();
    const targetDate = new Date(date);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDate.getDay()];

    // Get active availability rules
    const rules = await base44.asServiceRole.entities.AvailabilityRule.filter({ is_active: true });
    
    // Find rule for this day
    const applicableRule = rules.find(rule => rule.days_of_week.includes(dayName));
    
    if (!applicableRule) {
      return Response.json({ slots: [] });
    }

    // Get Google Calendar access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    // Get existing events for this day
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const calendarResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    const calendarData = await calendarResponse.json();
    const bookedSlots = (calendarData.items || []).map(event => ({
      start: new Date(event.start.dateTime || event.start.date),
      end: new Date(event.end.dateTime || event.end.date)
    }));

    // Generate available slots
    const [startHour, startMin] = applicableRule.start_time.split(':').map(Number);
    const [endHour, endMin] = applicableRule.end_time.split(':').map(Number);
    
    const slots = [];
    let currentTime = new Date(targetDate);
    currentTime.setHours(startHour, startMin, 0, 0);
    
    const endTime = new Date(targetDate);
    endTime.setHours(endHour, endMin, 0, 0);

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + applicableRule.duration_minutes * 60000);
      
      // Check if slot conflicts with existing events
      const isBooked = bookedSlots.some(booked => 
        (currentTime >= booked.start && currentTime < booked.end) ||
        (slotEnd > booked.start && slotEnd <= booked.end) ||
        (currentTime <= booked.start && slotEnd >= booked.end)
      );

      if (!isBooked) {
        slots.push({
          time: currentTime.toTimeString().slice(0, 5),
          available: true
        });
      }

      currentTime = new Date(currentTime.getTime() + applicableRule.interval_minutes * 60000);
    }

    return Response.json({ slots, rule: applicableRule });

  } catch (error) {
    console.error('Error getting available slots:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});