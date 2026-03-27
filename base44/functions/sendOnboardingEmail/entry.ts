import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { to_email, to_name, subject, body } = await req.json();

    if (!to_email || !subject || !body) {
      return Response.json({ error: 'to_email, subject, and body are required' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: to_email,
      subject,
      body,
      from_name: 'Your Team',
    });

    return Response.json({ success: true, sent_to: to_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});