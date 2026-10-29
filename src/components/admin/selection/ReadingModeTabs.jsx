// The two readings of one ledger: the community's own record, and the internal sets an
// administrator cast to build a private baseline. They are split apart, never mixed — a
// baseline only means something when nothing else is weighing inside it.
const MODES = [
  { key: 'live', label: 'Community', hint: 'marks by Fellows' },
  { key: 'internal', label: 'Internal review', hint: 'admin sets · never scored' },
];

export default function ReadingModeTabs({ mode, onChange, live = 0, internal = 0 }) {
  const counts = { live, internal };

  return (
    <div
      role="tablist"
      aria-label="Reading"
      className="inline-flex overflow-hidden rounded-md border border-editorial-navy/15 bg-white"
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
            className={`px-2.5 py-1 text-left transition-colors ${
              active ? 'bg-editorial-navy text-editorial-cream' : 'text-editorial-navy/60 hover:bg-editorial-cream'
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em]">{item.label}</span>
            <span
              className={`block text-[9px] uppercase tracking-[0.12em] ${
                active ? 'text-editorial-gold' : 'text-editorial-navy/40'
              }`}
            >
              {counts[item.key] || 0} marks · {item.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}