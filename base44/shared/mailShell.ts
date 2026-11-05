// THE HOUSE LETTER — one shell, every letter.
//
// The visual moat is not a style guide, it is this file: the cover, the rule, the type, the
// numbered signals and the one key at the foot. Every issue the Mail Room posts is rendered
// through it, so a letter that leaves the house looks like the house no matter who composed
// it or what it says.
//
// The letter opens on a navy cover plate the way the magazine opens on its cover: the
// wordmark, the issue's own number, the headline set large in the house serif. Then the paper
// begins, and the page underneath is cream — three signals numbered like an index, a closing
// held as a pull-quote, and a single deep-copper key.
//
// Written as tables and inline styles because that is what inboxes actually render. There is
// no flex, no external stylesheet and no script in here: the letter has to survive Outlook,
// Gmail and a phone in a coat pocket.

const SITE = 'https://top100aero.space';
const LOGO =
  'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png';

const INK = '#1e3a5a';
const MUTED = '#4a6b8a';
const COPPER = '#b87333';
const DEEP = '#8f5c2c';
const ROSE = '#c9a87c';
const CREAM = '#faf8f5';
const PAPER = '#ffffff';
const NIGHT = '#070c16';
const COVER = '#0e1e30';
const HAIR = '#e8dfd2';
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

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// ONE SIGNAL, numbered like an item in an index. The numeral is the whole trick: three
// paragraphs read as a newsletter, three numbered entries read as a brief.
function signal(
  story: { label?: string; title?: string; body?: string; url?: string },
  index: number,
): string {
  const title = String(story?.title || '').trim();
  const body = String(story?.body || '').trim();
  if (!title && !body) return '';
  const label = String(story?.label || '').trim();
  const link = String(story?.url || '').trim();

  return `<tr><td style="padding:0 32px;">
    ${index > 0 ? `<div style="height:1px;background:${HAIR};font-size:0;line-height:0;">&nbsp;</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="46" valign="top" style="width:46px;padding:20px 0 0;font-family:${SERIF};font-size:19px;line-height:1;color:${ROSE};">${pad(
          index + 1,
        )}</td>
        <td valign="top" style="padding:18px 0 20px;">
          ${
            label
              ? `<p style="margin:0 0 6px;font-family:${SANS};font-size:9.5px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:${DEEP};">${esc(
                  label,
                )}</p>`
              : ''
          }
          ${
            title
              ? `<p style="margin:0 0 8px;font-family:${SERIF};font-size:21px;line-height:1.28;font-weight:700;color:${INK};">${esc(
                  title,
                )}</p>`
              : ''
          }
          ${
            body
              ? `<p style="margin:0;font-family:${SANS};font-size:14.5px;line-height:1.66;color:${INK};">${prose(
                  body,
                )}</p>`
              : ''
          }
          ${
            link
              ? `<p style="margin:11px 0 0;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:0.6px;"><a href="${absolute(
                  link,
                )}" style="color:${DEEP};text-decoration:none;border-bottom:1px solid ${ROSE};">${esc(
                  label || 'Read it',
                )} &rarr;</a></p>`
              : ''
          }
        </td>
      </tr>
    </table>
  </td></tr>`;
}

// The letter. `first_name` and the unsubscribe token are the only per-recipient parts, so one
// composition reaches a whole segment without a second template.
export function renderLetter(issue: MailIssueLetter, firstName = 'Reader'): string {
  const number = issue?.issue_no ? `No ${esc(issue.issue_no)}` : '';
  const dated = esc(issue?.issue_date || '');
  const meta = [number, dated].filter(Boolean).join(' &nbsp;&middot;&nbsp; ');
  const stories = Array.isArray(issue?.sections) ? issue.sections.slice(0, 3) : [];
  const signals = stories
    .map((story, index) => signal(story, index))
    .filter(Boolean)
    .join('');
  const closing = String(issue?.closing || '').trim();
  const ctaLabel = String(issue?.cta_label || '').trim();
  const ctaUrl = absolute(issue?.cta_url);
  const standfirst = String(issue?.standfirst || '').trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${esc(issue?.headline || 'The Dispatch')}</title>
</head>
<body style="margin:0;padding:0;background:${NIGHT};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(
    standfirst,
  )}&#8203;&#65279;&#8203;&#65279;&#8203;&#65279;</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${NIGHT};padding:30px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;">

  <!-- THE COVER PLATE — the issue as it is titled, before a word of it is read. -->
  <tr><td style="background:${COVER};padding:0;">
    <div style="height:4px;background:${COPPER};font-size:0;line-height:0;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COVER};">
      <tr><td style="padding:24px 32px 0;" align="left">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="40" valign="middle" style="width:40px;">
            <img src="${LOGO}" width="34" height="34" alt="TOP 100 Aerospace &amp; Aviation" style="display:block;border:0;width:34px;height:34px;" />
          </td>
          <td valign="middle" style="padding-left:11px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;color:#f3ead9;">
            TOP 100 Aerospace &amp; Aviation
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:20px 32px 0;"><div style="height:1px;background:rgba(201,168,124,0.42);font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:22px 32px 0;font-family:${SANS};font-size:9.5px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${ROSE};">
        ${esc(issue?.kicker || 'The Dispatch')}
      </td></tr>
      <tr><td style="padding:12px 32px 0;font-family:${SERIF};font-size:34px;line-height:1.12;font-weight:700;color:#f7f2e8;">
        ${esc(issue?.headline || '')}
      </td></tr>
      ${
        standfirst
          ? `<tr><td style="padding:14px 32px 0;font-family:${SANS};font-size:15px;line-height:1.62;color:#bcccda;">${prose(
              standfirst,
            )}</td></tr>`
          : ''
      }
      ${
        meta
          ? `<tr><td style="padding:24px 32px 26px;font-family:${SANS};font-size:9.5px;font-weight:700;letter-spacing:2.6px;text-transform:uppercase;color:${ROSE};">${meta}</td></tr>`
          : `<tr><td style="height:26px;font-size:0;line-height:0;">&nbsp;</td></tr>`
      }
    </table>
  </td></tr>

  <!-- THE PAPER. -->
  <tr><td style="background:${PAPER};padding:0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">

      <tr><td style="background:${CREAM};padding:22px 32px 18px;">
        <p style="margin:0;font-family:${SERIF};font-size:16px;font-style:italic;line-height:1.5;color:${INK};">Dear ${esc(
          firstName,
        )},</p>
      </td></tr>

      <tr><td style="height:6px;font-size:0;line-height:0;background:${PAPER};">&nbsp;</td></tr>

      ${signals}

      ${
        closing
          ? `<tr><td style="padding:22px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CREAM};border-left:2px solid ${COPPER};">
          <tr><td style="padding:18px 20px;font-family:${SERIF};font-size:17px;font-style:italic;line-height:1.55;color:${INK};">${prose(
            closing,
          )}</td></tr>
        </table>
      </td></tr>`
          : ''
      }

      ${
        ctaLabel
          ? `<tr><td style="padding:26px 32px 34px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="background:${DEEP};border-radius:3px;border-bottom:2px solid #6f451f;">
            <a href="${ctaUrl}" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#fdf8f0;text-decoration:none;">${esc(
              ctaLabel,
            )}</a>
          </td>
        </tr></table>
      </td></tr>`
          : `<tr><td style="height:30px;font-size:0;line-height:0;">&nbsp;</td></tr>`
      }
    </table>
  </td></tr>

  <!-- THE FOOT — the night the letter came out of. -->
  <tr><td style="background:${COVER};padding:0;">
    <div style="height:2px;background:${COPPER};font-size:0;line-height:0;">&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COVER};">
      <tr><td style="padding:24px 32px 4px;font-family:${SERIF};font-size:15px;line-height:1.5;color:${ROSE};">
        The record, one brief at a time.
      </td></tr>
      <tr><td style="padding:0 32px 14px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.2px;text-transform:uppercase;color:#9fb4c7;">
        <a href="${SITE}" style="color:#9fb4c7;text-decoration:none;">top100aero.space</a>
        &nbsp;&middot;&nbsp; Est. 2022
      </td></tr>
      <tr><td style="padding:0 32px 26px;"><div style="height:1px;background:rgba(201,168,124,0.28);font-size:0;line-height:0;">&nbsp;</div></td></tr>
      <tr><td style="padding:0 32px 28px;font-family:${SANS};font-size:10.5px;line-height:1.7;color:#7d94aa;">
        You are reading this because you joined the Dispatch or hold a record in the house.
        This address is used for nothing else.
        <a href="{{unsubscribe_url}}" style="color:#a3b8c9;text-decoration:underline;">Leave the list</a>.
      </td></tr>
    </table>
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