import { Globe, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import CardActions from '@/components/card/CardActions';

// The other face of the same object: the card the badge hands over.
//
// Turn the badge over and the person is still the same person — same name, same lines,
// same code on the front — only now it is stock a stranger keeps rather than a plate worn
// on a lanyard. Light paper on purpose: the turn should read as badge → card, so nothing
// on this face takes its tone from the plate behind it.

const NAVY = '#1E3A5A';
const COPPER = '#B87333';
const CREAM = '#FAF8F5';
const LABEL = 'font-body text-[7.5px] font-bold uppercase tracking-[0.26em]';

const ROWS = [
  { key: 'email', Icon: Mail, get: (person) => person?.email, href: (value) => `mailto:${value}` },
  { key: 'phone', Icon: Phone, get: (person) => person?.phone, href: (value) => `tel:${value}` },
  { key: 'website', Icon: Globe, get: (person) => person?.website, href: (value) => value },
  { key: 'linkedin', Icon: Linkedin, get: (person) => person?.linkedin, href: (value) => value },
  { key: 'place', Icon: MapPin, get: (person) => person?.place, href: null },
];

const display = (value) => String(value || '').replace(/^https?:\/\//, '').replace(/\/$/, '');

export default function BadgeBack({ person, actions = [] }) {
  const rows = ROWS.map((row) => ({ ...row, value: row.get(person) })).filter((row) => row.value);

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden rounded-[18px]"
      style={{
        background: CREAM,
        boxShadow: `inset 0 0 0 1px rgba(30,58,90,0.18), 0 34px 60px -34px rgba(3,8,15,0.95)`,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: 'radial-gradient(rgba(30,58,90,0.05) 0.5px, transparent 0.6px)', backgroundSize: '4px 4px' }}
      />

      <div className="relative flex items-start justify-between px-4 pt-4">
        <p className={LABEL} style={{ color: COPPER }}>
          The card
        </p>
        <p className={LABEL} style={{ color: 'rgba(30,58,90,0.45)' }}>
          TOP 100
        </p>
      </div>

      <div className="relative px-4 pt-3">
        <h2 className="font-heading text-[23px] leading-[1.1]" style={{ color: NAVY }}>
          {person?.name || 'A Fellow'}
        </h2>
        {person?.role ? (
          <p className="mt-1 font-body text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'rgba(30,58,90,0.7)' }}>
            {person.role}
          </p>
        ) : null}
        {person?.org ? (
          <p className="mt-0.5 font-body text-[11px]" style={{ color: 'rgba(30,58,90,0.72)' }}>
            {person.org}
          </p>
        ) : null}
      </div>

      <div className="relative mx-4 my-3" style={{ height: 2, background: COPPER }} aria-hidden="true" />

      <div className="relative flex-1 space-y-1.5 px-4">
        {rows.length ? (
          rows.map(({ key, Icon, value, href }) => {
            const body = (
              <>
                <Icon className="h-3 w-3 shrink-0" style={{ color: COPPER }} />
                <span className="truncate font-body text-[10.5px]" style={{ color: NAVY }}>
                  {display(value)}
                </span>
              </>
            );
            return href ? (
              <a
                key={key}
                href={href(String(value))}
                target={key === 'website' || key === 'linkedin' ? '_blank' : undefined}
                rel="noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="flex items-center gap-2"
              >
                {body}
              </a>
            ) : (
              <p key={key} className="flex items-center gap-2">
                {body}
              </p>
            );
          })
        ) : (
          <p className="font-body text-[10.5px] leading-relaxed" style={{ color: 'rgba(30,58,90,0.55)' }}>
            Nothing printed on this face yet. The record behind the badge is still the way in.
          </p>
        )}

        {person?.tagline ? (
          <p className="pt-1.5 font-body text-[10px] italic leading-relaxed" style={{ color: 'rgba(30,58,90,0.62)' }}>
            {person.tagline}
          </p>
        ) : null}
      </div>

      {actions.length ? (
        <div className="relative px-4 pb-4 pt-2" onClick={(event) => event.stopPropagation()}>
          <CardActions actions={actions} />
        </div>
      ) : null}
    </div>
  );
}