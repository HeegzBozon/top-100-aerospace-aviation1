import { useState } from 'react';
import { Plus } from 'lucide-react';
import { brand, ink } from '@/components/nominate/NominateConfig';

// The standings as a table rather than a stack of cards.
//
// A card holds one name and a sentence; a table holds twenty at a glance, which is what a
// Fellow actually wants from their own record — the shape of their field, not a tour of it.
// Two figures stand beside each name, both taken from the marks the record holds: what the
// name carried (the marks it won) and how many marks it stood in. The second is there so a
// name that always stood last still reads as present and weighed, the way the live monitor
// prints it, instead of vanishing for want of a win.
//
// The name opens the profile; the key at the end puts the name on the Fellow's ballot.
// Nothing is added on the Fellow's behalf.

const FIRST = 20;
const RULE = '1px solid rgb(var(--editorial-sand-rgb))';

const HEAD = 'px-1.5 py-1.5 text-[7.5px] font-bold uppercase tracking-[0.16em]';

function contextOf(person) {
  const role = person.professional_role || person.title;
  const place = person.company || person.organization;
  const line = [role, place].filter(Boolean).join(' · ');
  return line || null;
}

export default function StandingsTable({ standings, onAdd, onView }) {
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
            <th scope="col" className={`${HEAD} w-[42px] text-right`} style={{ color: ink.label }}>
              Carried
            </th>
            <th scope="col" className={`${HEAD} w-[42px] text-right`} style={{ color: ink.label }}>
              Marks
            </th>
            <th scope="col" className="w-8">
              <span className="sr-only">Add to ballot</span>
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
                <td className="px-1 py-[5px] text-right align-middle">
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: brand.navy }}>
                    {person.wins}
                  </span>
                </td>
                <td className="px-1 py-[5px] text-right align-middle">
                  <span className="text-[10px] tabular-nums" style={{ color: ink.soft }}>
                    {person.marks}
                  </span>
                </td>
                <td className="pr-1.5 align-middle">
                  <button
                    type="button"
                    onClick={() => onAdd(person)}
                    aria-label={`Add ${person.name} to your ballot`}
                    className="flex h-5 w-5 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                    style={{ background: `${brand.navy}0A`, border: `1px solid ${brand.navy}14` }}
                  >
                    <Plus className="h-2.5 w-2.5" style={{ color: brand.navy }} />
                  </button>
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