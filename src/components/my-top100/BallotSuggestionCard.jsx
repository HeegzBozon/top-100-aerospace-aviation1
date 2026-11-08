import { useState } from 'react';
import { ArrowUpRight, Plus, RotateCw } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import FollowButton from '@/components/fellow-home/FollowButton';
import HonoreeChips from '@/components/voting/HonoreeChips';

// One suggested profile, read whole in the column where it is offered.
//
// The face carries the name and the two acts that matter — nominate them, follow them — on
// the same line as the name, with the record itself a single quiet key in the corner:
// opening a profile is a reading, not one of the acts. Under that sits everything the pool
// already holds — role, where they stand, why they are being shown, and the record's own
// line about them. The card turns over on its own key at the foot: the back carries the rest
// of what is known without a page change, so a Fellow can weigh a name here rather than leave
// the Manifest to do it.

const label = (value) => String(value || '').replace(/_/g, ' ');

function Face({ children, turned = false }) {
  return (
    <div
      className={`col-start-1 row-start-1 min-w-0 overflow-hidden break-words rounded-2xl p-2.5 [backface-visibility:hidden] ${
        turned ? '[transform:rotateY(180deg)]' : ''
      }`}
      style={{ background: 'white', border: `1px solid ${brand.navy}10` }}
    >
      {children}
    </div>
  );
}

export default function BallotSuggestionCard({ person, place, viewer, onAdd, onView }) {
  const [flipped, setFlipped] = useState(false);

  const role = person.professional_role || person.title;
  const org = person.organization || person.company;
  const portrait = person.avatar_url || person.photo_url;
  const where = [person.country, person.industry].filter(Boolean).join(' · ');
  const standing = [label(person.discipline), label(person.category)].filter(Boolean).join(' · ');

  return (
    <div className="min-w-0 [perspective:1000px]">
      <div
        className={`grid w-full min-w-0 transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* ── The face: who they are, and the two acts ── */}
        <Face>
          <div className="flex items-center gap-1.5">
            {/* The name's place in this Fellow's own standings — a position, never a count.
                The reason line says it in words, so the numeral is for the eye alone. */}
            {place ? (
              <span
                aria-hidden="true"
                className="w-3.5 shrink-0 font-heading text-[11px] leading-none tabular-nums"
                style={{ color: ink.label }}
              >
                {String(place).padStart(2, '0')}
              </span>
            ) : null}
            <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full" style={{ background: `${brand.navy}08` }}>
              {portrait ? (
                <img src={portrait} alt="" className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-[11px] font-bold"
                  style={{ color: `${brand.navy}70` }}
                >
                  {(person.name || '?')[0]}
                </div>
              )}
            </div>

            <p className="min-w-0 flex-1 truncate text-xs font-bold" style={{ color: brand.navy }}>
              {person.name}
            </p>

            <button
              type="button"
              onClick={() => onAdd(person)}
              aria-label={`Add ${person.name} to the ballot`}
              title="Add to ballot"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-[filter] active:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: '#F4F0E7' }}
            >
              <Plus className="h-3 w-3" />
            </button>

            {person.nominee_email && (
              <FollowButton
                iconOnly
                viewer={viewer}
                targetEmail={person.nominee_email}
                targetName={person.name}
                targetAvatar={portrait}
              />
            )}

            <button
              type="button"
              onClick={() => onView(person)}
              aria-label={`Read ${person.name}'s record`}
              title="View profile"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}12` }}
            >
              <ArrowUpRight className="h-3 w-3" style={{ color: `${brand.navy}75` }} />
            </button>
          </div>

          <div className="mt-1 pl-[34px]">
            {(role || org) && (
              <p className="truncate text-[10px]" style={{ color: `${brand.navy}55` }}>
                {[role, org].filter(Boolean).join(' · ')}
              </p>
            )}
            {where && (
              <p
                className="truncate text-[8.5px] font-bold uppercase tracking-[0.14em]"
                style={{ color: `${brand.navy}40` }}
              >
                {where}
              </p>
            )}
            <p className="mt-1 text-[10px] leading-snug" style={{ color: ink.label }}>
              {person.reason}
            </p>
            {person.description && (
              <p className="mt-1 line-clamp-2 text-[10px] leading-snug" style={{ color: `${brand.navy}65` }}>
                {person.description}
              </p>
            )}
            <HonoreeChips nominee={person} max={1} className="mt-1" />
          </div>

          <div className="mt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setFlipped(true)}
              aria-label={`More on ${person.name}`}
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ color: `${brand.navy}55`, border: `1px solid ${brand.navy}14` }}
            >
              More <RotateCw className="h-2.5 w-2.5" />
            </button>
          </div>
        </Face>

        {/* ── The back: the rest of the record, read where it stands ── */}
        <Face turned>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.2em]" style={{ color: `${brand.navy}45` }}>
                On the record
              </p>
              <p className="mt-0.5 truncate text-xs font-bold" style={{ color: brand.navy }}>
                {person.name}
              </p>
              {(role || org) && (
                <p className="truncate text-[10px]" style={{ color: `${brand.navy}55` }}>
                  {[role, org].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onView(person)}
              aria-label={`Read ${person.name}'s record`}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}12` }}
            >
              <ArrowUpRight className="h-3 w-3" style={{ color: `${brand.navy}75` }} />
            </button>
          </div>

          <p className="mt-1.5 line-clamp-5 text-[10px] leading-snug" style={{ color: `${brand.navy}70` }}>
            {person.description || 'No summary is on this record yet — open the profile for what the Fellow has filed.'}
          </p>

          {(where || standing) && (
            <div className="mt-1.5 space-y-0.5">
              {where && (
                <p className="text-[9px]" style={{ color: `${brand.navy}50` }}>
                  <span className="uppercase tracking-[0.14em]">Where</span> · {where}
                </p>
              )}
              {standing && (
                <p className="text-[9px] capitalize" style={{ color: `${brand.navy}50` }}>
                  <span className="uppercase tracking-[0.14em]">Standing</span> · {standing}
                </p>
              )}
            </div>
          )}

          <div className="mt-1 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onAdd(person)}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9.5px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: '#F4F0E7' }}
            >
              <Plus className="h-2.5 w-2.5" /> Add to ballot
            </button>
            <button
              type="button"
              onClick={() => setFlipped(false)}
              aria-label={`Turn ${person.name} back`}
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
              style={{ color: `${brand.navy}55`, border: `1px solid ${brand.navy}14` }}
            >
              <RotateCw className="h-2.5 w-2.5" /> Back
            </button>
          </div>
        </Face>
      </div>
    </div>
  );
}