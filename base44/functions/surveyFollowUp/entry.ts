import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { data } = body;

    if (!data?.respondent_email) {
      return Response.json({ skipped: true, reason: 'No respondent email' });
    }

    const firstName = (data.respondent_name || '').split(' ')[0] || 'there';

    const html = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #faf8f5; padding: 40px 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="font-size: 11px; letter-spacing: 3px; color: #c9a87c; text-transform: uppercase; font-weight: 700;">
            TOP 100 Aerospace & Aviation
          </span>
        </div>

        <div style="background: white; border-radius: 16px; padding: 40px 32px; border: 1px solid rgba(30,58,90,0.08);">
          <h1 style="font-size: 24px; color: #1e3a5a; margin: 0 0 16px; font-family: Georgia, serif;">
            Thank you, ${firstName}.
          </h1>
          <p style="color: #1e3a5a; opacity: 0.7; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
            Your response has been received. Every signal helps us build a more comprehensive picture of the aerospace community — and your input shapes the trajectory.
          </p>

          <div style="border-top: 1px solid rgba(30,58,90,0.08); padding-top: 24px; margin-top: 24px;">
            <p style="font-size: 12px; letter-spacing: 2px; color: #c9a87c; text-transform: uppercase; font-weight: 700; margin: 0 0 16px;">
              What's Next
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding: 8px 0;">
                  <a href="https://top100aero.space" style="display: inline-block; padding: 12px 24px; background: #1e3a5a; color: white; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 600;">
                    Explore TOP 100
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <a href="https://calendar.app.google/TrL8saY6XS6tdVj1A" style="display: inline-block; padding: 12px 24px; background: #c9a87c; color: #0a1526; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 600;">
                    Let's Talk — Book a Call
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <a href="https://wefunder.com/top.100.aerospace.aviation" style="display: inline-block; padding: 12px 24px; border: 1px solid #1e3a5a; color: #1e3a5a; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 600;">
                    Follow Our Fundraising Journey
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="https://www.linkedin.com/in/matthiga/" style="color: #1e3a5a; text-decoration: underline; font-size: 13px; opacity: 0.5;">
            Connect on LinkedIn
          </a>
          <p style="font-size: 10px; color: #1e3a5a; opacity: 0.25; letter-spacing: 2px; text-transform: uppercase; margin-top: 16px;">
            top100aero.space
          </p>
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: data.respondent_email,
      subject: `Thank you for your response, ${firstName}`,
      body: html,
      from_name: 'TOP 100 Aerospace & Aviation',
    });

    return Response.json({ success: true, email: data.respondent_email });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});