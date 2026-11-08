import { Search, X, BadgeCheck, Rows3, LayoutGrid } from 'lucide-react';

// The reading's own controls, cut for the machine.
//
// One cream band under the navy plate: the field the names are read through, then the
// narrowings — cohort, field, order, verification — and the two ways of hanging the same
// pool. Every control is a real form element: a field, two native selects and pressed
// keys, because a native select is the one list a thumb, a mouse and a wheel can all
// open and the glass already hands its own picker to the system.
//
// Navy ink on cream: the plate above is where the cream stops, so nothing here is ever
// printed in a tone the surface cannot carry.

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
  { key: 'random', label: 'Random' },
  { key: 'name', label: 'A–Z' },
  { key: 'recent', label: 'Newest' },
];

const COHORTS = [
  { key: 'all', label: 'All' },
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

const VIEWS = [
  { key: 'list', label: 'Roll', Icon: Rows3 },
  { key: 'gallery', label: 'Gallery', Icon: LayoutGrid },
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
  view,
  onView,
  autoFocus = false,
}) {
  return (
    <div className="border-t border-editorial-copper/40 bg-editorial-cream px-4 pb-2.5 pt-2">
      {/* The field: one line of ink struck under the plate. */}
      <div className="flex items-center gap-2 border-b border-editorial-navy/25 pb-1.5 focus-within:border-editorial-copper">
        <Search className="h-3.5 w-3.5 shrink-0 text-editorial-navy/45" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search a name, role or company"
          aria-label="Search the directory"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent font-body text-[16px] text-editorial-navy outline-none placeholder:text-editorial-navy/40 md:text-[13px]"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery('')}
            aria-label="Clear the search"
            className="shrink-0 text-editorial-navy/45 hover:text-editorial-navy focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* The narrowings, and the two views. */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
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

        <select
          value={field}
          onChange={(event) => onField(event.target.value)}
          aria-label="Field"
          className={`${chip} cursor-pointer border-editorial-navy/20 text-editorial-navy ${
            field !== 'all' ? 'bg-editorial-gold/25' : 'bg-transparent'
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
            sort !== 'random' ? 'bg-editorial-gold/25' : 'bg-transparent'
          }`}
        >
          {ORDERS.map((option) => (
            <option key={option.key} value={option.key}>
              Order: {option.label}
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

        {/* The same pool, two ways. Held at the margin of the band because it changes the
            hanging of the reading, never what is in it. */}
        <div className="ml-auto flex items-center border border-editorial-navy/20">
          {VIEWS.map(({ key, label, Icon }) => {
            const active = view === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => onView(key)}
                aria-label={`${label} view`}
                title={`${label} view`}
                className={`flex h-8 items-center gap-1 px-2 font-body text-[9.5px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
                  active
                    ? 'bg-editorial-navy text-editorial-cream'
                    : 'text-editorial-navy/60 hover:text-editorial-navy'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}