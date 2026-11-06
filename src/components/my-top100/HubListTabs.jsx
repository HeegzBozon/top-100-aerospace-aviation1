import { MANIFEST, CROSSCHECK } from '@/components/voting/ballotNaming';

// The three surfaces of the committee, drawn as keys on a rule rather than as pills: the
// office at the left, then the Fellow's own publication, then the weighing. The one in
// hand is struck in copper along its foot; the count sits in the margin of its label.
const PREFLIGHT = 'Pre-Flight';

export default function HubListTabs({ activeTab, onTabChange, nominationCount = 0, listCount = 0 }) {
  const tabs = [
    { key: 'start', label: PREFLIGHT },
    { key: 'nominate', label: MANIFEST, count: listCount, of: 100 },
    { key: 'vote', label: CROSSCHECK },
  ];

  return (
    <div className="sticky top-0 z-30 border-b border-editorial-navy/12 bg-editorial-cream/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-4 lg:px-6">
        <div className="flex items-end gap-6 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`-mb-px shrink-0 border-b-2 pb-2.5 pt-3 font-body text-[10.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  isActive
                    ? 'border-editorial-copper text-editorial-navy'
                    : 'border-transparent text-editorial-navy/45 hover:text-editorial-navy/80'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1.5 text-[10px] tabular-nums opacity-60">
                    {tab.count}
                    {tab.of ? ` / ${tab.of}` : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="hidden shrink-0 pb-3 font-body text-[9.5px] uppercase tracking-[0.16em] text-editorial-navy/40 sm:block">
          {nominationCount > 0
            ? `${nominationCount} filed this session`
            : 'The order is the finding'}
        </p>
      </div>
    </div>
  );
}