export default function EmailTemplatePreview() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f5f2ed;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;">Calibrate your communication preferences for the Aerospace Talent Graph launch.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f2ed;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,90,0.06);">
<tr><td style="height:4px;background:linear-gradient(90deg,#1e3a5a 0%,#c9a87c 100%);"></td></tr>
<tr><td align="center" style="padding:36px 40px 0;">
<span style="font-size:11px;letter-spacing:3px;color:#c9a87c;text-transform:uppercase;font-weight:700;">TOP 100 Aerospace &amp; Aviation</span>
</td></tr>
<tr><td style="padding:32px 40px 0;">
<p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#1e3a5a;">Matthew Higa here.</p>
<p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#1e3a5a;">As we move toward the launch of the <strong>Aerospace Talent Graph</strong>, the velocity of our updates is increasing. We are currently finalizing the 2025 Honoree rankings and deploying our Phase 1 infrastructure.</p>
<p style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#1e3a5a;">We respect the signal-to-noise ratio of your inbox. To ensure you receive only the technical depth and program updates relevant to your role in the ecosystem, please calibrate your communication preferences below.</p>
</td></tr>
<tr><td align="center" style="padding:0 40px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" style="border-radius:999px;background:linear-gradient(135deg,#c9a87c,#d4a574);">
<a href="#" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#0a1526;text-decoration:none;letter-spacing:0.5px;font-family:'Helvetica Neue',Arial,sans-serif;">Calibrate My Access</a>
</td></tr></table>
</td></tr>
<tr><td style="padding:0 40px 36px;">
<p style="margin:0;font-size:13px;line-height:1.7;color:#1e3a5a;opacity:0.55;">If you choose not to update your preferences, we will maintain your current subscription for all flagship announcements.</p>
</td></tr>
<tr><td style="padding:0 40px;"><div style="height:1px;background-color:rgba(30,58,90,0.08);"></div></td></tr>
<tr><td style="padding:28px 40px 8px;">
<p style="margin:0;font-size:14px;font-style:italic;color:#c9a87c;">Ad astra,</p>
</td></tr>
<tr><td style="padding:0 40px 36px;">
<p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#1e3a5a;">Matthew Higa</p>
<p style="margin:0;font-size:13px;color:#1e3a5a;opacity:0.5;">Founder, TOP 100</p>
</td></tr>
</table>

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
<tr><td align="center" style="padding:28px 24px 8px;">
<a href="https://www.linkedin.com/in/matthiga/" style="color:#1e3a5a;text-decoration:underline;font-size:12px;opacity:0.4;">LinkedIn</a>
<span style="color:#1e3a5a;opacity:0.2;padding:0 8px;">·</span>
<a href="https://top100aero.space" style="color:#1e3a5a;text-decoration:underline;font-size:12px;opacity:0.4;">Website</a>
<span style="color:#1e3a5a;opacity:0.2;padding:0 8px;">·</span>
<a href="https://wefunder.com/top.100.aerospace.aviation" style="color:#1e3a5a;text-decoration:underline;font-size:12px;opacity:0.4;">Invest</a>
</td></tr>
<tr><td align="center" style="padding:12px 24px;">
<p style="margin:0;font-size:11px;color:#1e3a5a;opacity:0.3;line-height:1.7;">TOP 100 Aerospace &amp; Aviation<br/>8 The Green, Suite A, Dover, DE 19901, USA</p>
</td></tr>
<tr><td align="center" style="padding:0 24px 8px;">
<p style="margin:0;font-size:11px;color:#1e3a5a;opacity:0.3;line-height:1.7;">You received this email because you are a registered member of the TOP 100 platform.</p>
</td></tr>
<tr><td align="center" style="padding:0 24px 32px;">
<p style="margin:0;font-size:11px;color:#1e3a5a;opacity:0.3;">
<a href="#" style="color:#1e3a5a;text-decoration:underline;">Unsubscribe</a>
&nbsp;·&nbsp;
<a href="https://top100aero.space/PrivacyPolicy" style="color:#1e3a5a;text-decoration:underline;">Privacy Policy</a>
&nbsp;·&nbsp;
<a href="#" style="color:#1e3a5a;text-decoration:underline;">Data Rights</a>
</p>
</td></tr>
<tr><td align="center" style="padding:0 24px 24px;">
<p style="margin:0;font-size:10px;color:#1e3a5a;opacity:0.18;letter-spacing:2px;text-transform:uppercase;">© 2026 top100aero.space</p>
</td></tr>
</table>

</td></tr></table>
</body></html>`;

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      <iframe
        srcDoc={html}
        title="Email Template Preview"
        className="w-full min-h-screen border-0"
        style={{ height: '100vh' }}
      />
    </div>
  );
}