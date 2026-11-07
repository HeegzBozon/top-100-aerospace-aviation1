// ── The code mail ──
//
// One message, one job: put six digits in front of the person who asked for them.
// It is written here rather than in the Emails desk because a template cannot be
// created on a branch; when this lands on main it should become a designed template
// and this module retired. Until then it stays deliberately plain, because the
// address it goes to is a work mailbox that is usually not an app account, and a
// plain transactional note is the least likely to be screened away.

function escapeHtml(value: string): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function workEmailCodeText({
  code,
  firstName,
  organisation,
}: {
  code: string;
  firstName: string;
  organisation?: string;
}) {
  const employer = organisation ? ` at ${organisation}` : '';
  return [
    `Hello ${firstName},`,
    '',
    `Here is the six-digit code that confirms you hold this work address${employer}. It expires in ten minutes.`,
    '',
    `    ${code}`,
    '',
    'Enter it on your record at TOP 100 Aerospace & Aviation: https://top100aero.space/Profile?surface=view',
    '',
    'If you did not ask for this code, nothing has changed on your record. You can ignore this message and the code will expire on its own.',
    '',
    'TOP 100 Aerospace & Aviation',
    'A verified professional record for women in aerospace and aviation.',
  ].join('\n');
}

export function workEmailCodeHtml({
  code,
  firstName,
  organisation,
}: {
  code: string;
  firstName: string;
  organisation?: string;
}) {
  const employer = organisation
    ? ` at <strong style="color:#1e3a5a;">${escapeHtml(organisation)}</strong>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Your confirmation code</title>
  </head>
  <body style="margin:0;padding:0;background:#070c16;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070c16;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #e5e5e5;border-radius:3px;overflow:hidden;">
            <tr>
              <td style="background:#1e3a5a;padding:22px 36px;">
                <div style="font-family:'Playfair Display',Georgia,serif;font-size:17px;font-weight:700;color:#ffffff;letter-spacing:0.02em;">
                  TOP 100 Aerospace &amp; Aviation
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 36px 0;">
                <h1 style="margin:0;font-family:'Playfair Display',Georgia,serif;font-size:27px;line-height:1.18;font-weight:700;color:#1e3a5a;">
                  Confirm your work address
                </h1>
                <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1e3a5a;">
                  Hello ${escapeHtml(firstName)}, here is the six-digit code that confirms you hold this work address${employer}. It expires in ten minutes.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px 4px;">
                <div style="font-family:Arial,Helvetica,sans-serif;font-size:36px;font-weight:700;letter-spacing:9px;color:#1e3a5a;text-align:center;padding:16px 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;">
                  ${escapeHtml(code)}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px 32px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.7;color:#1e3a5a;">
                  Enter it on your record to confirm your employer.
                </p>
                <p style="margin:20px 0 0;">
                  <a href="https://top100aero.space/Profile?surface=view" style="display:inline-block;background:#1e3a5a;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:3px;">
                    Open your record
                  </a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#faf8f5;padding:20px 36px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#1e3a5a;">
                  If you did not ask for this code, nothing has changed on your record. You can ignore this message and the code will expire on its own.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background:#070c16;padding:20px 36px;">
                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:1.4px;color:#c9a87c;">
                  TOP 100 AEROSPACE &amp; AVIATION
                </p>
                <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#9fb0c2;">
                  A verified professional record for women in aerospace and aviation.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}