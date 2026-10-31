// The two readings of one ledger: the community's own record, and the internal sets an
// administrator cast to build a private baseline. They are split apart, never mixed — a
// baseline only means something when nothing else is weighing inside it.
const MODES = [
  { key: 'live', label: 'Community' },
  { key: 'internal', label: 'Internal review' },
];

export default function ReadingModeTabs({ mode, onChange, live = 0, internal = 0 }) {
  const counts = { live, internal };

  return (
    <div
      role="tablist"
      aria-label="Reading"
      className="grid w-full grid-cols-2 gap-1 rounded-lg border border-editorial-navy/15 bg-white p-1"
    >
      {MODES.map((item) => {
        const active = item.key === mode;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={`flex items-baseline justify-between gap-1 rounded-md px-2 py-1.5 transition-colors ${
              active ? 'bg-editorial-navy text-editorial-cream' : 'text-editorial-navy/60 hover:bg-editorial-cream'
            }`}
          >
            <span className="truncate text-[9.5px] font-bold uppercase tracking-[0.14em]">{item.label}</span>
            <span
              className={`shrink-0 text-[11px] font-semibold tabular-nums ${
                active ? 'text-editorial-gold' : 'text-editorial-navy/45'
              }`}
            >
              {(counts[item.key] || 0).toLocaleString()}
            </span>
          </button>
        );
      })}
    </div>
  );
}