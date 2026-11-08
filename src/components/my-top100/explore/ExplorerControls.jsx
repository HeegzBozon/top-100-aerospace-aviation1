import { Search, X, BadgeCheck } from 'lucide-react';

// The reading's own controls, cut for the machine.
//
// Search sits on the navy plate; the three narrowings sit on the cream under it. Every
// control is a real form element — a field, two native selects, a pressed key — because
// a native select is the one list a thumb, a mouse and a wheel can all open, and the
// glass already hands its own picker to the system.

const FIELDS = [
  { key: 'all', label: 'All fields' },
  { key: 'space_rd', label: 'Space R&D' },
  { key: 'commercial_aviation', label: 'Aviation' },
  { key: 'defense', label: 'Defense' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'operations', label: 'Operations' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'policy', label: 'Policy' },
  { key: 'entrepreneurship', label: 'Founders' },
];

const ORDERS = [
  { key: 'random', label: 'Order: random' },
  { key: 'name', label: 'Order: A–Z' },
  { key: 'recent', label: 'Order: newest' },
  { key: 'verified', label: 'Order: verified' },
];

const COHORTS = [
  { key: 'all', label: 'All' },
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

const chip =
  'h-8 border px-2.5 font-body text-[9.5px] font-bold uppercase tracking-[0.12em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper';

export default function ExplorerControls({
  query,
  onQuery,
  cohort,
  onCohort,
  field,
  onField,
  sort,
  onSort,
  verifiedOnly,
  onVerifiedOnly,
  autoFocus = false,
}) {
  return (
    <>
      {/* The field: one line of type struck straight onto the navy plate. */}
      <div className="mt-3 flex items-center gap-2 border-b border-editorial-cream/25 pb-1.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-editorial-cream/50" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search a name, role or company"
          aria-label="Search the directory"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent font-body text-[16px] text-editorial-cream outline-none placeholder:text-editorial-cream/40 md:text-[13px]"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery('')}
            aria-label="Clear the search"
            className="shrink-0 text-editorial-cream/50 hover:text-editorial-cream focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-gold"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* The narrowings, on the cream. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex items-center gap-1">
          {COHORTS.map((option) => {
            const active = cohort === option.key;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => onCohort(option.key)}
                className={`${chip} ${
                  active
                    ? 'border-editorial-navy bg-editorial-navy text-editorial-cream'
                    : 'border-editorial-navy/25 text-editorial-navy/70 hover:border-editorial-navy/50'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <select
          value={field}
          onChange={(event) => onField(event.target.value)}
          aria-label="Field"
          className={`${chip} cursor-pointer border-editorial-navy/20 text-editorial-navy ${
            field !== 'all' ? 'bg-editorial-gold/20' : 'bg-transparent'
          }`}
        >
          {FIELDS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(event) => onSort(event.target.value)}
          aria-label="Order"
          className={`${chip} cursor-pointer border-editorial-navy/20 text-editorial-navy ${
            sort !== 'random' ? 'bg-editorial-gold/20' : 'bg-transparent'
          }`}
        >
          {ORDERS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          aria-pressed={verifiedOnly}
          onClick={() => onVerifiedOnly(!verifiedOnly)}
          className={`${chip} flex items-center gap-1 ${
            verifiedOnly
              ? 'border-editorial-copper bg-editorial-copper text-editorial-cream'
              : 'border-editorial-navy/25 text-editorial-navy/70 hover:border-editorial-navy/50'
          }`}
        >
          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
          Verified
        </button>
      </div>
    </>
  );
}