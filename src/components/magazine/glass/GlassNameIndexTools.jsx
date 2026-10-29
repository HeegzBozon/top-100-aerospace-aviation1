import { Search, X } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

const SORTS = [
  { key: 'rank', label: 'Rank' },
  { key: 'name', label: 'A–Z' },
];

// Search and sort, across the head of the register: a field that narrows the roll to the
// names, regions and stands that match, and the two orders it can be read in.
export default function GlassNameIndexTools({ order, onOrder, query, onQuery }) {
  return (
    <div className="mt-2.5 flex items-center gap-1.5">
      <label
        className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2.5 py-1.5"
        style={{ background: '#fff', border: '1px solid rgba(30,58,90,0.22)' }}
      >
        <Search className="h-3 w-3 flex-none" style={{ color: 'rgba(30,58,90,0.5)' }} />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search names, regions"
          aria-label="Search the index of names"
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:opacity-50"
          style={{ color: P.navy }}
        />
        {query ? (
          <button type="button" onClick={() => onQuery('')} aria-label="Clear search" className="flex-none">
            <X className="h-3 w-3" style={{ color: P.navy }} />
          </button>
        ) : null}
      </label>
      <div
        className="flex flex-none items-center rounded-full p-0.5"
        style={{ border: '1px solid rgba(30,58,90,0.22)' }}
        role="group"
        aria-label="Sort the index"
      >
        {SORTS.map((sort) => {
          const on = order === sort.key;
          return (
            <button
              key={sort.key}
              type="button"
              onClick={() => onOrder(sort.key)}
              aria-pressed={on}
              className="rounded-full px-2.5 py-1 font-mono text-[9px]"
              style={{ background: on ? P.navy : 'transparent', color: on ? P.cream : P.navy }}
            >
              {sort.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}