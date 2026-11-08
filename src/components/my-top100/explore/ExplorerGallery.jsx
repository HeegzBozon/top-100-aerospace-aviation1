import { BadgeCheck, Check, Award } from 'lucide-react';

// The same reading, hung as plates.
//
// A roll is for reading names in order; a gallery is for reading faces. This is the
// second view of one pool, not a second pool: the same filtering, the same ordering, the
// same two actions on each record, only seated as portrait plates so a reader can meet
// the field by eye.
export default function ExplorerGallery({ nominees, addedIds, onOpen, onNominate }) {
  return (
    <ul className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
      {nominees.map((nominee) => {
        const avatar = nominee.avatar_url || nominee.photo_url;
        const verified = nominee.verified_status === 'fully_verified';
        const isAdded = addedIds.has(nominee.id);
        const role = [nominee.title || nominee.professional_role, nominee.company || nominee.organization]
          .filter(Boolean)
          .join(' · ');

        return (
          <li
            key={nominee.id}
            className="group flex flex-col overflow-hidden border border-editorial-navy/15 bg-editorial-cream transition-colors hover:border-editorial-copper/60"
          >
            <button
              type="button"
              onClick={() => onOpen(nominee)}
              aria-label={`Read ${nominee.name}`}
              className="block w-full text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
            >
              <span className="block aspect-[4/5] w-full overflow-hidden bg-editorial-navy">
                {avatar ? (
                  <img src={avatar} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-heading text-[28px] text-editorial-cream/70">
                    {nominee.name?.[0]?.toUpperCase() || '·'}
                  </span>
                )}
              </span>
              <span className="block px-2 pt-1.5">
                <span className="flex items-center gap-1">
                  <span className="truncate font-body text-[11.5px] font-semibold leading-tight text-editorial-navy">
                    {nominee.name}
                  </span>
                  {verified && <BadgeCheck className="h-3 w-3 shrink-0 text-editorial-copper" aria-label="Verified" />}
                </span>
                <span className="mt-0.5 block truncate font-body text-[9px] leading-tight text-editorial-navy/55">
                  {role || 'On the record'}
                </span>
              </span>
            </button>

            <span className="mt-1.5 flex border-t border-editorial-navy/10">
              <button
                type="button"
                onClick={() => onOpen(nominee)}
                className="flex flex-1 items-center justify-center gap-1 py-1.5 font-body text-[8.5px] font-bold uppercase tracking-[0.1em] text-editorial-navy transition-colors hover:bg-editorial-navy hover:text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={() => onNominate(nominee)}
                disabled={isAdded}
                aria-label={isAdded ? `${nominee.name} is already on your Top 100` : `Nominate ${nominee.name}`}
                className={`flex flex-1 items-center justify-center gap-1 border-l border-editorial-navy/10 py-1.5 font-body text-[8.5px] font-bold uppercase tracking-[0.1em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
                  isAdded
                    ? 'cursor-default text-editorial-label'
                    : 'text-editorial-copper hover:bg-editorial-copper hover:text-editorial-cream'
                }`}
              >
                {isAdded ? <Check className="h-2.5 w-2.5" /> : <Award className="h-2.5 w-2.5" />}
                {isAdded ? 'Added' : 'Nominate'}
              </button>
            </span>
          </li>
        );
      })}
    </ul>
  );
}