import { Search, X, BadgeCheck, Rows3, LayoutGrid } from 'lucide-react';

// One tool for reading the field.
//
// The search, the standing tags and the order used to be three bands with three different
// manners; they are one instrument now. The field the names are read through sits on top,
// the tags that hold the institution's own groupings — the cohorts first, since Women, Men
// and Angels are families of the record rather than words filed against it — sit under it
// as pills that press on and off, and the order and the hanging of the reading ride at the
// margin. The cloud the popover passes in is the foot of the same band, so narrowing by
// word and narrowing by cohort are the same motion in the same place.
//
// Nothing here is "all": a pill that is not pressed is the whole field, which is why the
// cohort row carries no Everything key and the family select simply reads Every family.
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

// The institution's own groupings, fixed: these are never filed against a record, they are
// what the record is, so they are the first pills and they never move.
const COHORTS = [
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

const VIEWS = [
  { key: 'list', label: 'Roll', Icon: Rows3 },
  { key: 'gallery', label: 'Gallery', Icon: LayoutGrid },
];

const chip =
  'h-7 border px-2 font-body text-[9px] font-bold uppercase tracking-[0.12em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper';

const pill = (active) =>
  `flex h-7 items-center gap-1 rounded-full border px-2.5 font-body text-[9px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
    active
      ? 'border-editorial-navy bg-editorial-navy text-editorial-cream'
      : 'border-editorial-navy/25 text-editorial-navy/70 hover:border-editorial-navy/60'
  }`;

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
  families = [],
  family,
  onFamily,
  autoFocus = false,
  children,
}) {
  return (
    <div className="border-t border-editorial-copper/40 bg-editorial-cream px-4 pb-2 pt-2">
      {/* The field, and the hanging of the reading. */}
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 border-b border-editorial-navy/25 pb-1.5 focus-within:border-editorial-copper">
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

        <div className="flex shrink-0 items-center border border-editorial-navy/20">
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
                className={`flex h-7 items-center gap-1 px-1.5 font-body text-[9px] font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper ${
                  active ? 'bg-editorial-navy text-editorial-cream' : 'text-editorial-navy/60 hover:text-editorial-navy'
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      {/* The tags that hold: the cohorts first, then verification, then the family and the
          order the same band is read by. */}
      <div className="mt-1.5 flex flex-wrap items-center gap-1">
        {COHORTS.map((option) => {
          const active = cohort === option.key;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => onCohort(active ? 'all' : option.key)}
              className={pill(active)}
            >
              {option.label}
            </button>
          );
        })}

        <button
          type="button"
          aria-pressed={verifiedOnly}
          onClick={() => onVerifiedOnly(!verifiedOnly)}
          className={`${pill(verifiedOnly)} ${verifiedOnly ? 'border-editorial-copper bg-editorial-copper' : ''}`}
        >
          <BadgeCheck className="h-3 w-3" aria-hidden="true" />
          Verified
        </button>

        <span className="mx-0.5 h-5 w-px bg-editorial-navy/15" aria-hidden="true" />

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

        {families.length > 0 && (
          <select
            value={family}
            onChange={(event) => onFamily(event.target.value)}
            aria-label="Tag family"
            className={`${chip} cursor-pointer border-editorial-navy/20 text-editorial-navy ${
              family !== 'all' ? 'bg-editorial-gold/25' : 'bg-transparent'
            }`}
          >
            <option value="all">Every family</option>
            {families.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        <select
          value={sort}
          onChange={(event) => onSort(event.target.value)}
          aria-label="Order"
          className={`${chip} ml-auto cursor-pointer border-editorial-navy/20 text-editorial-navy ${
            sort !== 'random' ? 'bg-editorial-gold/25' : 'bg-transparent'
          }`}
        >
          {ORDERS.map((option) => (
            <option key={option.key} value={option.key}>
              Order: {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* The vocabulary, at the foot of the same band. */}
      {children}
    </div>
  );
}