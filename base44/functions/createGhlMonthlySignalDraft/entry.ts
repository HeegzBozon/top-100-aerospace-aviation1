import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2023-02-21';

const SUBJECT = 'Monthly Signal Report: May 2026';
const REPORT_URL = 'https://top100aero.space/newsletter/may-2026';

function buildEmailHtml() {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${SUBJECT}</title>
  </head>
  <body style="margin:0;padding:0;background:#0f1d2d;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0f1d2d;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#13263c;border:1px solid rgba(201,168,124,0.28);border-radius:28px;overflow:hidden;">
            <tr>
              <td style="padding:42px 34px;background:linear-gradient(135deg,#10243a 0%,#1e3a5a 62%,#0f1d2d 100%);text-align:center;">
                <div style="display:inline-block;padding:8px 14px;border:1px solid rgba(201,168,124,0.35);border-radius:999px;color:#c9a87c;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">TOP 100 Aerospace & Aviation</div>
                <h1 style="margin:24px 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:42px;line-height:1.08;color:#ffffff;">Monthly Signal Report: May 2026</h1>
                <p style="margin:0 auto;max-width:540px;color:#d8dee8;font-size:17px;line-height:1.7;">The aerospace and aviation sector was stress-tested across commercial aviation, defense, and space — and the people in our index kept building.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:34px;color:#d8dee8;font-size:16px;line-height:1.75;">
                <p style="margin:0 0 18px;">In the first four months of 2026, the sector faced a Middle East war that grounded a million passengers overnight, a Pentagon budget request that rewrote the meaning of defense spending, and a space race now involving six-figure satellite filings and a potential record-setting IPO.</p>
                <p style="margin:0 0 18px;">Inside this month’s report: Spirit’s sudden collapse and what it means for low-cost flying, the defense production surge, Artemis II’s return from beyond Earth orbit, and the TOP 100 Fellows connected to that mission.</p>
                <div style="margin:30px 0;padding:24px;border-left:3px solid #c9a87c;background:rgba(201,168,124,0.08);border-radius:0 18px 18px 0;">
                  <p style="margin:0;color:#c9a87c;font-family:Georgia,'Times New Roman',serif;font-size:23px;line-height:1.45;font-style:italic;">Timelines that were measured in decades are now measured in years.</p>
                </div>
                <p style="margin:0 0 24px;">This is the world we are navigating, together. Let’s get into it.</p>
                <div style="text-align:center;margin:34px 0;">
                  <a href="${REPORT_URL}" style="display:inline-block;background:#c9a87c;color:#0f1d2d;text-decoration:none;font-weight:800;padding:15px 26px;border-radius:999px;">Read the May Signal Report</a>
                </div>
                <hr style="border:0;border-top:1px solid rgba(201,168,124,0.22);margin:34px 0;" />
                <h2 style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:26px;margin:0 0 12px;">Season 4 nominations are open</h2>
                <p style="margin:0 0 18px;">If you know someone building, flying, funding, or shaping the future of aerospace and aviation, put their name in. Women, men, angels. Forty countries, seventy disciplines, one standard.</p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="https://top100aero.space/nominate" style="display:inline-block;border:1px solid #c9a87c;color:#c9a87c;text-decoration:none;font-weight:800;padding:13px 24px;border-radius:999px;">Nominate for Season 4</a>
                </div>
                <p style="margin:30px 0 0;color:#9fb0c3;font-size:13px;line-height:1.6;text-align:center;">Think Global. Act Local. Ad Astra.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function ghlRequest(path, options = {}) {
  const token = Deno.env.get('GOHIGHLEVEL_API_KEY');
  const response = await fetch(`${GHL_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Version: GHL_VERSION,
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  return { ok: response.ok, status: response.status, data };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const locationId = Deno.env.get('GOHIGHLEVEL_LOCATION_ID');
    const userId = Deno.env.get('GOHIGHLEVEL_USER_ID');

    if (!locationId || !userId) {
      return Response.json({ success: false, error: 'Missing GoHighLevel location ID or user ID' }, { status: 200 });
    }

    const campaignPayload = {
      name: SUBJECT,
      editorType: 'html',
      editorContent: buildEmailHtml(),
      timeZone: 'UTC',
      userId,
      userName: user.full_name || 'TOP 100 Aerospace & Aviation',
    };

    const result = await ghlRequest(`/emails/public/v2/locations/${encodeURIComponent(locationId)}/campaigns/email-campaign`, {
      method: 'POST',
      body: JSON.stringify(campaignPayload),
    });

    if (!result.ok) {
      return Response.json({ success: false, status: result.status, details: result.data }, { status: 200 });
    }

    return Response.json({
      success: true,
      audience: 'All GHL contacts',
      subject: SUBJECT,
      status: result.data?.status || 'draft',
      campaign: result.data,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});