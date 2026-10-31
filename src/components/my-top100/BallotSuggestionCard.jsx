import { Plus, UserRound } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import FollowButton from '@/components/fellow-home/FollowButton';
import HonoreeChips from '@/components/voting/HonoreeChips';

// One suggested profile. It offers three acts and ranks none of them into anything: add it
// to the ballot, open the record, or follow the person in AeroSync. The portrait is the
// record's own; nothing is composed here.
export default function BallotSuggestionCard({ person, viewer, onAdd, onView }) {
  const role = person.professional_role || person.title;
  const org = person.organization || person.company;
  const portrait = person.avatar_url || person.photo_url;

  return (
    <div className="rounded-2xl p-2.5" style={{ background: 'white', border: `1px solid ${brand.navy}10` }}>
      <div className="flex items-start gap-2.5">
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full" style={{ background: `${brand.navy}08` }}>
          {portrait ? (
            <img src={portrait} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] font-bold" style={{ color: `${brand.navy}70` }}>
              {(person.name || '?')[0]}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold" style={{ color: brand.navy }}>{person.name}</p>
          {(role || org) && (
            <p className="truncate text-[10px]" style={{ color: `${brand.navy}55` }}>
              {[role, org].filter(Boolean).join(' · ')}
            </p>
          )}
          <HonoreeChips nominee={person} max={1} className="mt-1" />
          <p className="mt-1 text-[10px] leading-snug" style={{ color: brand.gold }}>{person.reason}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onAdd(person)}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-[filter] active:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)`, color: '#F4F0E7' }}
        >
          <Plus className="h-3 w-3" /> Add to ballot
        </button>
        <button
          type="button"
          onClick={() => onView(person)}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
          style={{ background: `${brand.navy}06`, color: `${brand.navy}80`, border: `1px solid ${brand.navy}14` }}
        >
          <UserRound className="h-3 w-3" /> Profile
        </button>
      </div>

      {person.nominee_email && (
        <FollowButton
          viewer={viewer}
          targetEmail={person.nominee_email}
          targetName={person.name}
          targetAvatar={portrait}
        />
      )}
    </div>
  );
}