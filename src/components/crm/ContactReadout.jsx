import { useEffect, useState } from 'react';
import { Briefcase, Globe, Link2, Mail, MapPin, Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { C, asHref, formatDay, sinceLabel } from './crmConfig';

// The record, read back: everything printed on the card, the show it came from, what was
// agreed next, and when the relationship was last worked. The card itself is shown through a
// short-lived signed link, because it is stored privately and never sits behind a public URL.
function Line({ icon: Icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: C.copper }} />
      <div className="min-w-0">
        <p className="text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="block truncate text-[12.5px] underline decoration-dotted"
            style={{ color: C.navy }}
          >
            {value}
          </a>
        ) : (
          <p className="break-words text-[12.5px]" style={{ color: C.navy }}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function Block({ label, children }) {
  return (
    <div className="rounded-lg p-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
      <p className="text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: C.copper }}>
        {label}
      </p>
      {children}
    </div>
  );
}

export default function ContactReadout({ contact }) {
  const [card, setCard] = useState({ url: '', state: contact.card_file_uri ? 'loading' : 'none' });

  useEffect(() => {
    if (!contact.card_file_uri) {
      setCard({ url: '', state: 'none' });
      return undefined;
    }
    let alive = true;
    setCard({ url: '', state: 'loading' });
    base44.integrations.Core.CreateFileSignedUrl({
      file_uri: contact.card_file_uri,
      expires_in: 3600,
    })
      .then(({ signed_url }) => alive && setCard({ url: signed_url, state: 'ready' }))
      .catch(() => alive && setCard({ url: '', state: 'failed' }));
    return () => {
      alive = false;
    };
  }, [contact.card_file_uri]);

  const place = [contact.city, contact.country].filter(Boolean).join(', ');
  const show = [contact.conference_name, contact.met_context].filter(Boolean).join(' — ');
  const hasContactLines = Boolean(
    contact.email || contact.phone || contact.linkedin_url || contact.website || place || contact.company,
  );

  return (
    <div className="space-y-3">
      {hasContactLines ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Line icon={Mail} label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : ''} />
          <Line icon={Phone} label="Telephone" value={contact.phone} href={contact.phone ? `tel:${contact.phone}` : ''} />
          <Line icon={Link2} label="LinkedIn" value={contact.linkedin_url} href={asHref(contact.linkedin_url)} />
          <Line icon={Globe} label="Site" value={contact.website} href={asHref(contact.website)} />
          <Line icon={MapPin} label="Based in" value={place} />
          <Line icon={Briefcase} label="Organization" value={contact.company} />
        </div>
      ) : null}

      <Block label="Where you met">
        <p className="mt-1 text-[12.5px]" style={{ color: C.navy }}>
          {show || 'No show recorded'}
          {contact.met_on ? ` · ${formatDay(contact.met_on)}` : ''}
        </p>
      </Block>

      <Block label="Agreed next">
        <p className="mt-1 text-[12.5px] leading-relaxed" style={{ color: C.navy }}>
          {contact.next_step || 'Nothing was written down.'}
        </p>
        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>
          {contact.last_touch ? `Last worked ${sinceLabel(contact.last_touch)}` : 'Never worked'}
          {contact.met_on ? ` · met ${formatDay(contact.met_on)}` : ''}
        </p>
      </Block>

      {contact.notes ? (
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.16em]" style={{ color: C.copper }}>
            Notes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-[12.5px] leading-relaxed" style={{ color: C.navy }}>
            {contact.notes}
          </p>
        </div>
      ) : null}

      {contact.tags?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md px-2 py-1 text-[8.5px] font-bold uppercase tracking-[0.14em]"
              style={{ background: C.sand, color: C.navy }}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {card.state === 'loading' ? (
        <p className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>
          Reading the card
        </p>
      ) : null}
      {card.state === 'failed' ? (
        <p className="text-[11.5px]" style={{ color: C.muted }}>
          The captured card could not be opened just now.
        </p>
      ) : null}
      {card.state === 'ready' ? (
        <figure>
          <img
            src={card.url}
            alt={`The business card captured for ${contact.full_name}`}
            className="w-full rounded-lg"
            style={{ border: `1px solid ${C.border}` }}
          />
          <figcaption className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ color: C.muted }}>
            The card as captured, stored privately
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}