import { Mail, MapPin, Globe, Phone } from 'lucide-react';
import CredentialCode from '@/components/my-top100/credentials/CredentialCode';

// ── The business card ──
//
// The flavour that is kept after the room empties: the lines the Fellow chose to print,
// on the institution's cream stock, with the code in the corner for whoever would rather
// scan than read.
const LABEL = 'font-body text-[8px] font-bold uppercase tracking-[0.2em]';

const LINE = 'flex items-center gap-2 font-body text-[11px] text-editorial-navy/75';

export default function CredentialCard({ person, code }) {
  const lines = [
    { icon: Mail, value: person.email },
    { icon: Phone, value: person.phone },
    { icon: Globe, value: String(person.website || '').replace(/^https?:\/\//, '') },
    { icon: MapPin, value: person.location },
  ].filter((line) => line.value && String(line.value).trim());

  return (
    <div className="relative overflow-hidden rounded-[12px] border border-editorial-copper/45 bg-editorial-cream px-5 pb-4 pt-5 shadow-[0_18px_40px_-30px_rgba(3,8,15,0.85)]">
      <p className={`${LABEL} text-editorial-label`}>TOP 100 Aerospace &amp; Aviation</p>

      <p className="mt-3.5 font-heading text-[22px] leading-tight text-editorial-navy">
        {person.name || 'Your record is still blank'}
      </p>
      {person.role && (
        <p className="mt-1 font-body text-[11.5px] leading-snug text-editorial-navy/80">{person.role}</p>
      )}
      {person.org && (
        <p className="mt-0.5 font-body text-[10.5px] uppercase tracking-[0.14em] text-editorial-navy/55">
          {person.org}
        </p>
      )}

      {lines.length > 0 && (
        <>
          <span aria-hidden="true" className="my-3.5 block h-px w-full bg-editorial-copper/45" />
          <ul className="space-y-1.5">
            {lines.map(({ icon: Icon, value }) => (
              <li key={String(value)} className={LINE}>
                <Icon className="h-3 w-3 shrink-0 text-editorial-copper" strokeWidth={1.8} />
                <span className="truncate">{value}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {person.tagline && (
        <p className="mt-3 font-body text-[11px] leading-relaxed text-editorial-navy/65">{person.tagline}</p>
      )}

      <CredentialCode
        code={code}
        size={64}
        rule="rgb(var(--editorial-copper-rgb) / 0.45)"
        background="rgb(var(--editorial-cream-rgb))"
        className="mt-4"
      />
    </div>
  );
}