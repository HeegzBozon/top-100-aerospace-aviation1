import { Link } from 'react-router-dom';
import { ArrowUpRight, BadgeCheck, MapPin } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { MODES, CAPABILITY_LABELS, OFFERING_LABELS, availabilityOption } from '@/components/profile/intent/intentConfig';

const labelOf = (map, key) => map[key] || key;

// One person on the desk. The card carries only what the roster returns: who they
// are, which doors are open, and their own two-line statement. The order of the
// roster is alphabetical and nothing on this card changes it.
export default function TalentDeskCard({ person }) {
  const hireOpen = person.modes?.hire;
  const commercialOpen = person.modes?.commercial;
  const availability =
    availabilityOption('hire', person.hire_availability) ||
    availabilityOption('commercial', person.commercial_engagements);
  const pitch = hireOpen ? person.hire_pitch : person.commercial_pitch;
  const chips = (hireOpen ? person.hire_capabilities : person.commercial_offerings) || [];
  const chipMap = hireOpen ? CAPABILITY_LABELS : OFFERING_LABELS;

  return (
    <Link
      to={person.id ? `/profiles/${person.id}` : '/talent-desk'}
      className="group flex h-full flex-col rounded-2xl p-4 transition-shadow hover:shadow-lg"
      style={{ background: 'rgba(255,255,255,0.94)', border: `1px solid ${B.border}`, boxShadow: '0 1px 3px rgba(7,17,31,0.05)' }}
    >
      <div className="flex items-start gap-3">
        {person.avatar_url ? (
          <img
            src={person.avatar_url}
            alt={person.name}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-full object-cover"
            style={{ border: `1px solid ${B.border}` }}
          />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-heading text-[16px] font-semibold"
            style={{ background: 'rgba(30,58,90,0.08)', color: B.navy }}
          >
            {(person.name || '?').charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="min-w-0 font-heading text-[15.5px] font-semibold leading-tight" style={{ color: B.navy }}>
              {person.name}
            </h3>
            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: B.copper }} />
          </div>
          {(person.title || person.company) && (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed" style={{ color: B.muted }}>
              {[person.title, person.company].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {person.verified_status && person.verified_status !== 'unverified' && (
              <span className="flex items-center gap-1 text-[9.5px] font-semibold uppercase tracking-[0.1em]" style={{ color: B.navy }}>
                <BadgeCheck className="h-3 w-3" /> Verified
              </span>
            )}
            {person.country && (
              <span className="flex items-center gap-1 text-[9.5px] uppercase tracking-[0.1em]" style={{ color: B.muted }}>
                <MapPin className="h-2.5 w-2.5" /> {person.country}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1">
        {hireOpen && (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ background: 'rgba(30,58,90,0.08)', color: B.navy }}>
            {MODES.hire.label}
          </span>
        )}
        {commercialOpen && (
          <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]" style={{ background: 'rgba(184,115,51,0.12)', color: B.copper }}>
            {MODES.commercial.label}
          </span>
        )}
        {availability && (
          <span className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.14em]" style={{ border: `1px solid ${B.border}`, color: B.muted }}>
            {availability.label}
          </span>
        )}
      </div>

      {pitch && (
        <p className="mt-2 line-clamp-3 text-[12px] leading-relaxed" style={{ color: B.navy }}>
          {pitch}
        </p>
      )}

      {chips.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1 pt-2.5">
          {chips.slice(0, 3).map((key) => (
            <span key={key} className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: 'rgba(30,58,90,0.04)', color: B.muted }}>
              {labelOf(chipMap, key)}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}