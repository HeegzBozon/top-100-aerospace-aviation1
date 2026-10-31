import { Search, X } from 'lucide-react';
import { B, DISCIPLINES } from './conferenceConfig';

const SCOPES = [
  { key: 'all', label: 'Everything' },
  { key: 'ahead', label: 'Ahead' },
  { key: 'concluded', label: 'Concluded' },
];

// The circuit is read, not browsed: one line to search it, one to narrow it by domain,
// one to say whether the reader is looking ahead or back.
export default function ConferenceFilters({ query, domain, scope, onQuery, onDomain, onScope, filtering, onClear }) {
  return (
    <div className="mt-5">
      <div
        className="flex items-center gap-2 rounded-sm px-3 py-2"
        style={{ background: '#fff', border: `1px solid ${B.border}` }}
      >
        <Search className="h-3.5 w-3.5 shrink-0" style={{ color: B.copper }} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Conference, city or organizer"
          aria-label="Search the circuit"
          className="w-full bg-transparent text-[12.5px] outline-none"
          style={{ color: B.navy }}
        />
        {query && (
          <button type="button" onClick={() => onQuery('')} aria-label="Clear the search" className="shrink-0">
            <X className="h-3.5 w-3.5" style={{ color: B.muted }} />
          </button>
        )}
      </div>

      <div className="scrollbar-hide -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-0.5 md:mx-0 md:flex-wrap md:px-0">
        {[{ key: null, label: 'All domains' }, ...DISCIPLINES].map((item) => {
          const active = (domain || null) === item.key;
          return (
            <button
              key={item.key || 'all'}
              type="button"
              onClick={() => onDomain(item.key)}
              aria-pressed={active}
              className="shrink-0 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em]"
              style={{
                background: active ? B.navy : '#fff',
                color: active ? '#fff' : B.navy,
                border: `1px solid ${active ? B.navy : B.border}`,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex gap-1" role="group" aria-label="Which part of the circuit to read">
          {SCOPES.map((item) => {
            const active = scope === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onScope(item.key)}
                aria-pressed={active}
                className="rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em]"
                style={{
                  background: active ? `${B.copper}1a` : 'transparent',
                  color: active ? B.copper : B.muted,
                  border: `1px solid ${active ? B.copper : 'transparent'}`,
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {filtering && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 text-[9.5px] font-bold uppercase tracking-[0.14em]"
            style={{ color: B.copper }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}