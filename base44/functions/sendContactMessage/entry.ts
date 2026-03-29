import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { sender_name, sender_email, message } = await req.json();

  if (!sender_email || !message) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Store on platform
  await base44.asServiceRole.entities.ContactMessage.create({
    sender_name: sender_name || undefined,
    sender_email,
    message,
    status: 'new',
  });

  // Send notification email
  await base44.asServiceRole.integrations.Core.SendEmail({
    to: 'matthew@top100aero.space',
    subject: `New Contact Message from ${sender_name || sender_email}`,
    body: `<p><strong>From:</strong> ${sender_name || 'Anonymous'} &lt;${sender_email}&gt;</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>`,
  });

  return Response.json({ success: true });
});