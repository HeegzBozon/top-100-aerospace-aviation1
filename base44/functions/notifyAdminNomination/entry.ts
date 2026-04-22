import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = 'matthew@top100aero.space';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { data, event } = await req.json();

    if (!data) {
      return Response.json({ skipped: true });
    }

    const nomineeName = data.name || 'Unknown';
    const nomineeEmail = data.nominee_email || '';
    const nominatedBy = data.nominated_by || data.created_by || '';
    const reason = data.nomination_reason || data.description || '';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `🏆 New Nomination — ${nomineeName}`,
      body: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e3a5a;padding:24px;border-radius:12px 12px 0 0">
          <h2 style="color:#c9a87c;margin:0;font-size:18px">New Nomination Received</h2>
          <p style="color:#ffffff99;margin:4px 0 0;font-size:13px">TOP 100 Aerospace & Aviation</p>
        </div>
        <div style="padding:24px;background:#fff;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">
          <p style="margin:0 0 8px"><strong>Nominee:</strong> ${nomineeName}</p>
          <p style="margin:0 0 8px"><strong>Email:</strong> ${nomineeEmail}</p>
          <p style="margin:0 0 8px"><strong>Nominated by:</strong> ${nominatedBy}</p>
          ${reason ? `<p style="margin:0 0 16px"><strong>Reason:</strong> ${reason}</p>` : ''}
          <p style="color:#94a3b8;font-size:12px;margin:16px 0 0">Review in Admin → Nominees</p>
        </div>
      </div>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyAdminNomination error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});