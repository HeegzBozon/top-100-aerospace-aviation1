import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FUNNELS, coverageOf, findingsFor } from './funnelRegistry';
import FunnelJourney from './FunnelJourney';

// THE LEDGER — every journey the house runs, in one column, with the one being read beside it.
const worst = (id) => {
  const rows = findingsFor(id).filter((f) => f.severity === 'critical' || f.severity === 'high');
  if (rows.some((f) => f.severity === 'critical')) return 'bg-[#f2a1a1]';
  if (rows.length) return 'bg-[#e0a96b]';
  return 'bg-[#8ad4a8]';
};

export default function FunnelLedger({ selectedId, onSelect, evidence, evidenceState, evidenceError, onRetry }) {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FUNNELS;
    return FUNNELS.filter(
      (f) => f.name.toLowerCase().includes(q) || f.house.toLowerCase().includes(q) || f.gist.toLowerCase().includes(q),
    );
  }, [query]);

  const selected = FUNNELS.find((f) => f.id === selectedId) || FUNNELS[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
      <div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7d97ad]" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a journey"
            aria-label="Find a journey"
            className="w-full rounded-md border border-white/12 bg-white/[0.04] py-1.5 pl-8 pr-2.5 font-body text-xs text-editorial-cream placeholder:text-[#7d97ad] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-editorial-gold/60"
          />
        </div>

        {rows.length === 0 ? (
          <p className="mt-3 rounded-md border border-white/10 bg-white/[0.03] px-3 py-3 font-body text-xs leading-6 text-[#a3b8c9]">
            No journey answers to “{query}”.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-white/[0.06]">
            {rows.map((funnel) => {
              const cover = coverageOf(funnel);
              const isActive = funnel.id === selected.id;
              return (
                <li key={funnel.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(funnel.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2.5 text-left transition-colors ${
                      isActive ? 'bg-editorial-gold/12 shadow-[inset_0_0_0_1px_rgba(201,168,124,0.45)]' : 'hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 flex-none rounded-full ${worst(funnel.id)}`} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-body text-xs font-semibold text-editorial-cream">{funnel.name}</span>
                      <span className="block truncate font-body text-[10px] text-[#7d97ad]">{funnel.house}</span>
                    </span>
                    <span className="flex-none font-body text-[10px] tabular-nums text-[#a3b8c9]">
                      {cover.recorded}/{cover.total}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-3 font-body text-[10px] leading-5 text-[#7d97ad]">
          The count beside a name is the rungs of that journey with an instrument on them.
        </p>
      </div>

      <div className="rounded-md border border-white/10 bg-white/[0.02] p-4 md:p-5">
        <FunnelJourney
          funnel={selected}
          evidence={evidence?.[selected.id]}
          evidenceState={evidenceState}
          evidenceError={evidenceError}
          onRetry={onRetry}
        />
      </div>
    </div>
  );
}