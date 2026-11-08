import { Search, X, Rows3, LayoutGrid } from 'lucide-react';

// One tool for reading the field.
//
// The search, the order and the hanging of the reading ride one line, with the tags the
// popover passes in hanging directly under it. The field and the tag family are not offered
// here any more: both narrowings are served better by the words themselves, which carry how
// much of the reading each one holds — so a reading is set up by typing a name and pressing
// a word, not by setting two menus before anything can be seen.

const ORDERS = [
  { key: 'random', label: 'Random' },
  { key: 'name', label: 'A–Z' },
  { key: 'recent', label: 'Newest' },
];

const VIEWS = [
  { key: 'list', label: 'Roll', Icon: Rows3 },
  { key: 'gallery', label: 'Gallery', Icon: LayoutGrid },
];

const select =
  'h-7 shrink-0 cursor-pointer border border-editorial-navy/20 bg-transparent px-1.5 font-body text-[9px] font-bold uppercase tracking-[0.1em] text-editorial-navy focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-editorial-copper';

export default function ExplorerControls({
  query,
  onQuery,
  sort,
  onSort,
  view,
  onView,
  autoFocus = false,
  children,
}) {
  return (
    <div className="border-t border-editorial-copper/40 bg-editorial-cream px-4 pb-2 pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <div className="flex min-w-[140px] flex-1 items-center gap-2 border-b border-editorial-navy/25 pb-1 focus-within:border-editorial-copper">
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

        <select
          value={sort}
          onChange={(event) => onSort(event.target.value)}
          aria-label="Order"
          title="Order"
          className={`${select} ${sort !== 'random' ? 'bg-editorial-gold/25' : ''}`}
        >
          {ORDERS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>

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

      {/* The tags: the cohorts first, then the vocabulary, all as one row of pills. */}
      {children}
    </div>
  );
}