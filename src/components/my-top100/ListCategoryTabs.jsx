const TABS = [
  { key: 'all', label: 'All' },
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

// The columns of the Manifest, drawn as keys on a rule rather than as pills: the count
// sits in the margin of each label, and the one in hand is struck in copper along its foot.
export default function ListCategoryTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="mb-1 flex items-end gap-5 overflow-x-auto border-b border-editorial-navy/10 scrollbar-hide">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = counts[tab.key] || 0;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`relative -mb-px shrink-0 border-b-2 pb-2.5 font-body text-[10.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
              isActive
                ? 'border-editorial-copper text-editorial-navy'
                : 'border-transparent text-editorial-navy/45 hover:text-editorial-navy/75'
            }`}
          >
            {tab.label}
            {count > 0 && (
              <span className="ml-1.5 text-[10px] tabular-nums opacity-60">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}