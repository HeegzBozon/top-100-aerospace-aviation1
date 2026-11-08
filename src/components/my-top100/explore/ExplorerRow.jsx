import { BadgeCheck, Check, Award, UserRound } from 'lucide-react';
import HonoreeChips from '@/components/voting/HonoreeChips';

// One name on the roll.
//
// Set as a printed line rather than a card: the portrait in its own small plate, the name
// with its verification mark, the role under it, the volumes they are on the record for,
// and the two things a reader does with a name — read the record, or put them forward.
// Both are named keys, not a hover the glass cannot make: the whole line still opens the
// record, but nothing is left implicit.
//
// The line is not a nested-button sandwich: the reading area is one press that opens the
// record, and the honoree chips inside it keep their own press (they stop it), so a chip
// opens the archive's account of a volume without pulling the record up underneath it.
export default function ExplorerRow({ nominee, index, focused, isAdded, onOpen, onNominate }) {
  const avatar = nominee.avatar_url || nominee.photo_url;
  const verified = nominee.verified_status === 'fully_verified';
  const role = [nominee.title || nominee.professional_role, nominee.company || nominee.organization]
    .filter(Boolean)
    .join(' · ');

  return (
    <li
      data-row={index}
      className={`flex items-center gap-2 border-b border-l-2 border-editorial-navy/10 py-2 pl-0 pr-2.5 transition-colors ${
        focused ? 'border-l-editorial-copper bg-editorial-sand/60' : 'border-l-transparent'
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onDoubleClick={onOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen();
          }
        }}
        aria-label={`Read ${nominee.name}`}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 pl-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
      >
        <span className="h-9 w-9 shrink-0 overflow-hidden border border-editorial-copper/40 bg-editorial-navy text-editorial-cream">
          {avatar ? (
            <img src={avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-heading text-[13px]">
              {nominee.name?.[0]?.toUpperCase() || '·'}
            </span>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1">
            <span className="truncate font-body text-[12.5px] font-semibold text-editorial-navy">
              {nominee.name}
            </span>
            {verified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-editorial-copper" aria-label="Verified" />
            )}
          </span>
          {role && (
            <span className="mt-0.5 block truncate font-body text-[9.5px] text-editorial-navy/55">
              {role}
            </span>
          )}
          <HonoreeChips nominee={nominee} max={2} className="mt-1" />
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`View profile: ${nominee.name}`}
          title="View profile"
          className="flex items-center gap-1 border border-editorial-navy/30 px-1.5 py-1.5 font-body text-[8px] font-bold uppercase tracking-[0.1em] text-editorial-navy transition-colors hover:bg-editorial-navy hover:text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
        >
          <UserRound className="h-3 w-3" aria-hidden="true" />
          Profile
        </button>

        <button
          type="button"
          onClick={onNominate}
          disabled={isAdded}
          aria-label={isAdded ? `${nominee.name} is already on your Top 100` : `Nominate ${nominee.name}`}
          title={isAdded ? 'Already on your Top 100' : 'Nominate and add to your Top 100'}
          className={`flex items-center gap-1 border px-1.5 py-1.5 font-body text-[8px] font-bold uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
            isAdded
              ? 'cursor-default border-editorial-copper/40 text-editorial-label'
              : 'border-editorial-copper bg-editorial-copper text-editorial-cream hover:bg-editorial-label'
          }`}
        >
          {isAdded ? <Check className="h-3 w-3" aria-hidden="true" /> : <Award className="h-3 w-3" aria-hidden="true" />}
          {isAdded ? 'Added' : 'Nominate'}
        </button>
      </div>
    </li>
  );
}