// THE HOUSE LETTER — one shell, every letter.
//
// The visual moat is not a style guide, it is this file: the band, the rule, the type, the
// one key at the foot. Every issue the Mail Room posts is rendered through it, so a letter
// that leaves the house looks like the house no matter who composed it or what it says.
//
// Written as tables and inline styles because that is what inboxes actually render. There
// is no flex, no external stylesheet and no script in here: the letter has to survive
// Outlook, Gmail and a phone in a coat pocket.

const SITE = 'https://top100aero.space';
const LOGO =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png';

const INK = '#1e3a5a';
const MUTED = '#4a6b8a';
const COPPER = '#b87333';
const ROSE = '#c9a87c';
const PAPER = '#ffffff';
const NIGHT = '#070c16';
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";

export type MailIssueLetter = {
  issue_no?: number | string;
  issue_date?: string;
  kicker?: string;
  headline?: string;
  standfirst?: string;
  sections?: Array<{ label?: string; title?: string; body?: string; url?: string }>;
  closing?: string;
  cta_label?: string;
  cta_url?: string;
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Body copy keeps the editor's line breaks and nothing else: a letter is not a page.
function prose(value: unknown): string {
  return esc(value).replace(/\r?\n+/g, '<br />');
}

function absolute(url: unknown): string {
  const raw = String(url || '').trim();
  if (!raw) return SITE;
  if (/^https?:\/\//i.test(raw)) return esc(raw);
  return esc(`${SITE}${raw.startsWith('/') ? '' : '/'}${raw}`);
}

function section(story: { label?: string; title?: string; body?: string; url?: string }, first: boolean): string {
  if (!String(story?.title || '').trim() && !String(story?.body || '').trim()) return '';
  const rule = first
    ? ''
    : `<tr><td style="padding:0 32px;"><div style="height:1px;background:#e5e5e5;font-size:0;line-height:0;">&nbsp;</div></td></tr>`;
  const label = String(story?.label || '').trim()
    ? `<tr><td style="padding:0 32px 6px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8f5c2c;">${esc(
        story.label,
      )}</td></tr>`
    : '';
  const title = String(story?.title || '').trim()
    ? `<tr><td style="padding:0 32px 8px;font-family:${SERIF};font-size:21px;line-height:1.25;font-weight:700;color:${INK};">${esc(
        story.title,
      )}</td></tr>`
    : '';
  const body = String(story?.body || '').trim()
    ? `<tr><td style="padding:0 32px 8px;font-family:${SANS};font-size:15px;line-height:1.65;color:${INK};">${prose(
        story.body,
      )}</td></tr>`
    : '';
  const link = String(story?.url || '').trim()
    ? `<tr><td style="padding:0 32px 4px;font-family:${SANS};font-size:14px;font-weight:700;"><a href="${absolute(
        story.url,
      )}" style="color:${COPPER};text-decoration:none;">${esc(String(story.label || 'Read it').trim())} &rarr;</a></td></tr>`
    : '';

  return `${rule}<tr><td style="height:22px;font-size:0;line-height:0;">&nbsp;</td></tr>${label}${title}${body}${link}`;
}

// The letter. `first_name` and the unsubscribe token are the only per-recipient parts, so
// one composition reaches a whole segment without a second template.
export function renderLetter(issue: MailIssueLetter, firstName = 'Reader'): string {
  const meta = [issue?.issue_no ? `No ${esc(issue.issue_no)}` : '', esc(issue?.issue_date || '')]
    .filter(Boolean)
    .join(' &middot; ');
  const stories = Array.isArray(issue?.sections) ? issue.sections.slice(0, 3) : [];
  const signals = stories.map((story, index) => section(story, index === 0)).join('');
  const closing = String(issue?.closing || '').trim();
  const ctaLabel = String(issue?.cta_label || '').trim();
  const ctaUrl = absolute(issue?.cta_url);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(issue?.headline || 'The Dispatch')}</title>
</head>
<body style="margin:0;padding:0;background:${NIGHT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(issue?.standfirst || '')}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NIGHT};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:${PAPER};border-collapse:collapse;">

  <tr><td style="background:${COPPER};padding:20px 32px 10px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="64" valign="middle" style="width:64px;">
        <img src="${LOGO}" width="44" height="44" alt="TOP 100 Aerospace &amp; Aviation" style="display:block;border:0;width:44px;height:44px;" />
      </td>
      <td valign="middle" style="font-family:${SERIF};font-size:16px;font-weight:700;color:#000000;">
        TOP 100 Aerospace &amp; Aviation
      </td>
    </tr></table>
  </td></tr>

  ${
    meta
      ? `<tr><td style="background:${COPPER};padding:0 32px 16px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.4px;text-transform:uppercase;color:#000000;">${meta}</td></tr>`
      : ''
  }

  <tr><td style="padding:30px 32px 0;">
    <p style="margin:0 0 10px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8f5c2c;">${esc(
      issue?.kicker || 'The Dispatch',
    )}</p>
    <h1 style="margin:0 0 12px;font-family:${SERIF};font-size:30px;line-height:1.15;font-weight:700;color:${INK};">${esc(
      issue?.headline || '',
    )}</h1>
    <p style="margin:0;font-family:${SANS};font-size:16px;line-height:1.6;color:${INK};">${prose(issue?.standfirst)}</p>
  </td></tr>

  <tr><td style="padding:20px 32px 0;"><div style="height:2px;background:${COPPER};font-size:0;line-height:0;">&nbsp;</div></td></tr>

  <tr><td style="height:20px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="padding:0 32px;font-family:${SANS};font-size:15px;line-height:1.65;color:${INK};">Dear ${esc(
    firstName,
  )},</td></tr>

  ${signals}

  ${
    closing
      ? `<tr><td style="height:24px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="padding:0 32px;font-family:${SERIF};font-size:16px;font-style:italic;line-height:1.6;color:${INK};">${prose(
    closing,
  )}</td></tr>`
      : ''
  }

  ${
    ctaLabel
      ? `<tr><td style="height:22px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="padding:0 32px 30px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background:${COPPER};border-radius:3px;">
        <a href="${ctaUrl}" style="display:inline-block;padding:14px 26px;font-family:${SANS};font-size:14px;font-weight:700;color:#000000;text-decoration:none;">${esc(
          ctaLabel,
        )}</a>
      </td>
    </tr></table>
  </td></tr>`
      : `<tr><td style="height:30px;font-size:0;line-height:0;">&nbsp;</td></tr>`
  }

</table>

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
  <tr><td style="background:${NIGHT};padding:24px 32px 6px;font-family:${SANS};font-size:13px;line-height:1.6;color:${ROSE};">
    The record, one brief at a time.
  </td></tr>
  <tr><td style="background:${NIGHT};padding:0 32px 10px;font-family:${SANS};font-size:12px;line-height:1.6;color:#a3b8c9;">
    TOP 100 Aerospace &amp; Aviation &middot; <a href="${SITE}" style="color:${ROSE};text-decoration:none;">top100aero.space</a>
  </td></tr>
  <tr><td style="background:${NIGHT};padding:0 32px 28px;font-family:${SANS};font-size:11px;line-height:1.6;color:#7d94aa;">
    You are reading this because you joined the Dispatch or hold a record in the house.
    <a href="{{unsubscribe_url}}" style="color:#a3b8c9;text-decoration:underline;">Leave the list</a>.
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function letterSubject(issue: MailIssueLetter): string {
  return String(issue?.headline || '').trim() || 'The Dispatch';
}