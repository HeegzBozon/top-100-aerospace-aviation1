import { useMemo, useState } from 'react';
import { Check, Copy, Download, Mail, MapPin, Phone, Globe } from 'lucide-react';

const text = (value) => String(value ?? '').trim();
const escapeVcard = (value) =>
  String(value || '')
    .replace(/([,;\\])/g, '\\$1')
    .replace(/\r?\n/g, '\\n');

// The card as it is handed over: the lines the Fellow wrote, the two contact lines
// they chose to show, and a contact file a phone can save in one tap.
export default function BusinessCardPanel({ account, card, nominee, onChange }) {
  const [copied, setCopied] = useState(false);
  const data = card || {};

  const name = text(data.card_name) || text(account?.full_name) || 'Your name';
  const role = text(data.role_line);
  const organisation = text(data.organisation);
  const email = text(data.contact_email);
  const phone = text(data.phone);
  const website = text(data.website_url);
  const linkedin = text(data.linkedin_url);
  const location = text(data.location);
  const tagline = text(data.tagline);
  const showEmail = data.show_contact_email !== false;
  const showPhone = data.show_phone === true;

  const profileUrl = useMemo(() => {
    const id = nominee?.id;
    return `${window.location.origin}${id ? `/profiles/${id}` : '/Profile'}`;
  }, [nominee?.id]);

  const vcard = useMemo(() => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVcard(name)}`,
      organisation ? `ORG:${escapeVcard(organisation)}` : '',
      role ? `TITLE:${escapeVcard(role)}` : '',
      email && showEmail ? `EMAIL;TYPE=WORK:${escapeVcard(email)}` : '',
      phone && showPhone ? `TEL;TYPE=CELL:${escapeVcard(phone)}` : '',
      website ? `URL:${escapeVcard(website)}` : '',
      linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${escapeVcard(linkedin)}` : '',
      location ? `ADR;TYPE=WORK:;;${escapeVcard(location)};;;;` : '',
      tagline ? `NOTE:${escapeVcard(tagline)}` : '',
      `URL:${profileUrl}`,
      'END:VCARD',
    ];
    return lines.filter(Boolean).join('\r\n');
  }, [name, organisation, role, email, phone, website, linkedin, location, tagline, showEmail, showPhone, profileUrl]);

  const saveContact = () => {
    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    link.remove();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const toggles = [
    { key: 'show_contact_email', label: 'Show address', on: showEmail },
    { key: 'show_phone', label: 'Show number', on: showPhone },
  ];

  return (
    <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
      {/* The card itself, printed on the institution's stock. */}
      <div className="rounded-[10px] border border-editorial-copper/50 bg-editorial-cream p-6 shadow-[0_14px_30px_rgba(30,58,90,0.12)]">
        <p className="font-body text-[9px] font-semibold uppercase tracking-[0.28em] text-editorial-navy/55">
          TOP 100 Aerospace &amp; Aviation
        </p>
        <p className="mt-4 font-heading text-[24px] leading-tight text-editorial-navy">{name}</p>
        {role && <p className="mt-1 font-body text-[12.5px] text-editorial-navy/80">{role}</p>}
        {organisation && (
          <p className="font-body text-[11.5px] uppercase tracking-[0.14em] text-editorial-navy/60">
            {organisation}
          </p>
        )}

        <span aria-hidden="true" className="mt-4 mb-3 block h-px w-full bg-editorial-copper/50" />

        <ul className="space-y-1.5">
          {showEmail && email && <CardLine icon={Mail} value={email} />}
          {showPhone && phone && <CardLine icon={Phone} value={phone} />}
          {website && <CardLine icon={Globe} value={website.replace(/^https?:\/\//, '')} />}
          {location && <CardLine icon={MapPin} value={location} />}
        </ul>

        {tagline && (
          <p className="mt-4 font-body text-[11.5px] leading-relaxed text-editorial-navy/70">{tagline}</p>
        )}
      </div>

      <div>
        <p className="font-body text-[13px] leading-relaxed text-editorial-navy/70">
          The card is yours to hand over. Save it as a contact file and send it, or copy
          the link to your record.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={saveContact} className="pd-acct-link !py-2.5">
            <Download className="h-3.5 w-3.5" />
            Save contact file
          </button>
          <button type="button" onClick={copyLink} className="pd-acct-link !py-2.5">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Link copied' : 'Copy record link'}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {toggles.map((toggle) => (
            <button
              key={toggle.key}
              type="button"
              onClick={() => onChange({ [toggle.key]: !toggle.on })}
              aria-pressed={toggle.on}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-body text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                toggle.on
                  ? 'border-editorial-copper bg-editorial-copper/10 text-editorial-copper'
                  : 'border-editorial-navy/25 text-editorial-navy/55 hover:border-editorial-copper hover:text-editorial-copper'
              }`}
            >
              <Check className={`h-3 w-3 ${toggle.on ? 'opacity-100' : 'opacity-25'}`} strokeWidth={3} />
              {toggle.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardLine({ icon: Icon, value }) {
  return (
    <li className="flex items-center gap-2 font-body text-[11.5px] text-editorial-navy/75">
      <Icon className="h-3 w-3 shrink-0 text-editorial-copper" strokeWidth={1.8} />
      <span className="truncate">{value}</span>
    </li>
  );
}