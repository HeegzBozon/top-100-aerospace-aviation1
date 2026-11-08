import { useState } from 'react';
import { brand, ink } from '@/components/nominate/NominateConfig';
import StandingsRowKeys from '@/components/my-top100/StandingsRowKeys';

// The standings as a table rather than a stack of cards.
//
// A card holds one name and a sentence; a table holds twenty at a glance, which is what a
// Fellow actually wants from their own record — the shape of their field, not a tour of it.
// The order is the record's own, best first: each name's place and the name itself. The
// figure the place was read from stays in the record, not on the plate.
//
// Each name ends in its keys: read the record, follow the Fellow, put the name on the
// Fellow's ballot. Nothing is added on the Fellow's behalf.

const FIRST = 20;
const RULE = '1px solid rgb(var(--editorial-sand-rgb))';

const HEAD = 'px-1.5 py-1.5 text-[7.5px] font-bold uppercase tracking-[0.16em]';

function contextOf(person) {
  const role = person.professional_role || person.title;
  const place = person.company || person.organization;
  const line = [role, place].filter(Boolean).join(' · ');
  return line || null;
}

export default function StandingsTable({ standings, viewer, onAdd, onView }) {
  const [shown, setShown] = useState(FIRST);
  const rows = standings.slice(0, shown);

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ background: 'rgba(255,255,255,0.72)', border: RULE }}
    >
      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">Your Crosscheck standings</caption>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.5)' }}>
            <th scope="col" className={`${HEAD} w-7 text-left`} style={{ color: ink.label }}>
              №
            </th>
            <th scope="col" className={`${HEAD} text-left`} style={{ color: ink.label }}>
              Name
            </th>
            <th scope="col" className="w-[68px]">
              <span className="sr-only">Record, follow and ballot keys</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((person) => {
            const context = contextOf(person);
            const leader = person.place === 1;
            return (
              <tr key={person.id} style={{ borderTop: RULE }}>
                <td className="px-1.5 py-[5px] align-middle">
                  <span
                    className="text-[10px] font-bold tabular-nums"
                    style={{ color: leader ? 'rgb(var(--editorial-copper-rgb))' : ink.soft }}
                  >
                    {person.place}
                  </span>
                </td>
                <td className="min-w-0 py-[5px] pr-1 align-middle">
                  <button
                    type="button"
                    onClick={() => onView(person)}
                    className="block w-full truncate text-left text-[11px] font-semibold leading-tight transition-colors hover:text-editorial-copper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{ color: brand.navy }}
                  >
                    {person.name}
                  </button>
                  {context && (
                    <span className="mt-[1px] block truncate text-[8.5px] leading-tight" style={{ color: ink.soft }}>
                      {context}
                    </span>
                  )}
                </td>
                <td className="pr-1.5 align-middle">
                  <StandingsRowKeys person={person} viewer={viewer} onView={onView} onAdd={onAdd} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {standings.length > rows.length && (
        <button
          type="button"
          onClick={() => setShown(standings.length)}
          className="w-full py-2 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset"
          style={{ borderTop: RULE, color: ink.label }}
        >
          Show {standings.length - rows.length} more
        </button>
      )}
    </div>
  );
}