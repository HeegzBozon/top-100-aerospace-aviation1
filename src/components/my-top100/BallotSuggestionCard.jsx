import { ArrowUpRight, Plus } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import FollowButton from '@/components/fellow-home/FollowButton';
import HonoreeChips from '@/components/voting/HonoreeChips';

// One suggested profile, read whole in the column where it is offered: who they are, where
// they work, why they are being shown at all, and the record's own line about them. The two
// acts worth making are on one row at the foot — nominate them, or follow them — and the
// record itself is a single quiet key in the corner, because opening a profile is a reading
// rather than one of the acts. The portrait is the record's own; nothing is composed here.
export default function BallotSuggestionCard({ person, viewer, onAdd, onView }) {
  const role = person.professional_role || person.title;
  const org = person.organization || person.company;
  const portrait = person.avatar_url || person.photo_url;
  const where = [person.country, person.industry].filter(Boolean).join(' · ');
  const line = person.description || person.impact_summary;

  return (
    <div
      className="relative rounded-2xl p-2.5"
      style={{ background: 'white', border: `1px solid ${brand.navy}10` }}
    >
      <button
        type="button"
        onClick={() => onView(person)}
        aria-label={`Read ${person.name}'s record`}
        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}12` }}
      >
        <ArrowUpRight className="h-3 w-3" style={{ color: `${brand.navy}75` }} />
      </button>

      <div className="flex items-start gap-2.5 pr-7">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full" style={{ background: `${brand.navy}08` }}>
          {portrait ? (
            <img src={portrait} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-[12px] font-bold"
              style={{ color: `${brand.navy}70` }}
            >
              {(person.name || '?')[0]}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold" style={{ color: brand.navy }}>
            {person.name}
          </p>
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
          <p className="mt-1 text-[10px] leading-snug" style={{ color: brand.gold }}>
            {person.reason}
          </p>
          {line && (
            <p className="mt-1 line-clamp-2 text-[10px] leading-snug" style={{ color: `${brand.navy}65` }}>
              {line}
            </p>
          )}
          <HonoreeChips nominee={person} max={1} className="mt-1" />
        </div>
      </div>

      {/* The two acts, on one row: the ballot and the follow. */}
      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onAdd(person)}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-[filter] active:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: '#F4F0E7' }}
        >
          <Plus className="h-3 w-3" /> Add to ballot
        </button>
        {person.nominee_email && (
          <FollowButton
            inline
            viewer={viewer}
            targetEmail={person.nominee_email}
            targetName={person.name}
            targetAvatar={portrait}
          />
        )}
      </div>
    </div>
  );
}