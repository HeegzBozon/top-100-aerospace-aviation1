import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { serviceId, availableDate } = await req.json();

    // Fetch service
    const services = await base44.entities.Service.filter({ id: serviceId });
    if (!services.length) {
      return Response.json({ error: 'Service not found' }, { status: 404 });
    }
    const service = services[0];

    // Only provider can trigger notifications
    if (service.provider_user_email !== user.email) {
      return Response.json({ error: 'Only provider can notify waitlist' }, { status: 403 });
    }

    // Get waitlisted users
    const waitlist = await base44.asServiceRole.entities.Waitlist.filter({ 
      service_id: serviceId, 
      status: 'waiting' 
    });

    if (waitlist.length === 0) {
      return Response.json({ notified: 0, message: 'No users on waitlist' });
    }

    const notified = [];
    for (const entry of waitlist) {
      // Send notification email
      await base44.integrations.Core.SendEmail({
        to: entry.user_email,
        subject: `Spot Available: ${service.title}`,
        body: `
Good news! A spot has opened up for "${service.title}".

${availableDate ? `Available date: ${new Date(availableDate).toLocaleDateString()}` : 'New availability has been added.'}

Book now before it's taken!

Note: You're receiving this because you joined the waitlist for this service.
        `.trim()
      });

      // Update waitlist status
      await base44.asServiceRole.entities.Waitlist.update(entry.id, {
        status: 'notified',
        notified_date: new Date().toISOString()
      });

      notified.push(entry.user_email);
    }

    return Response.json({ 
      success: true, 
      notified: notified.length,
      emails: notified
    });

  } catch (error) {
    console.error('Waitlist notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});