import { MANIFEST, CROSSCHECK } from '@/components/voting/ballotNaming';

// The four surfaces of the committee, drawn as keys on a rule rather than as pills:
// Pre-Flight (the letter and the check-in), the Fellow's own publication, the weighing,
// and then the Flight Plan — the field the Analyst reads it all from. The one in hand is
// struck in copper along its foot; the count sits in the margin of its label.
//
// The Flight Plan is the Analyst's own desk, and an Associate Analyst has not been graduated
// into the office that reads from it — so the key is not drawn until the office is held.
const PREFLIGHT = 'Pre-Flight';
const FLIGHT_PLAN = 'Flight Plan';

export default function HubListTabs({ activeTab, onTabChange, nominationCount = 0, listCount = 0, showFlightPlan = false, glowTab = null }) {
  const tabs = [
    { key: 'start', label: PREFLIGHT },
    { key: 'nominate', label: MANIFEST, count: listCount, of: 100 },
    { key: 'vote', label: CROSSCHECK },
    ...(showFlightPlan ? [{ key: 'flight', label: FLIGHT_PLAN }] : []),
  ];

  return (
    <div className="sticky top-0 z-30 border-b border-editorial-navy/12 bg-editorial-cream/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-4 lg:px-6">
        {/* The strip scrolls sideways only when the three keys cannot sit side by side, so
            it is clipped — never scrolled — in the other axis: a scroll container here used
            to print a bar across the labels the moment a key overhung its edge by a pixel. */}
        <div className="flex min-w-0 items-end gap-6 overflow-x-auto overflow-y-hidden scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            // A key that has just been unlocked is struck until it is walked through: the
            // glow is the house saying there is a desk here you have not sat at yet.
            const isGlowing = glowTab === tab.key && !isActive;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative shrink-0 px-1 pb-2.5 pt-3 font-body text-[10.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  isActive
                    ? 'text-editorial-navy'
                    : 'text-editorial-navy/45 hover:text-editorial-navy/80'
                } ${isGlowing ? 'tab-glow' : ''}`}
              >
                {tab.label}
                {isGlowing && (
                  <span
                    aria-hidden="true"
                    className="ml-1.5 inline-block h-1 w-1 animate-pulse rounded-full bg-editorial-gold align-middle"
                  />
                )}
                {tab.count > 0 && (
                  <span className="ml-1.5 text-[10px] tabular-nums opacity-60">
                    {tab.count}
                    {tab.of ? ` / ${tab.of}` : ''}
                  </span>
                )}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2px] bg-editorial-copper"
                  />
                )}
              </button>
            );
          })}
        </div>

        {nominationCount > 0 && (
          <p className="hidden shrink-0 pb-3 font-body text-[9.5px] uppercase tracking-[0.16em] text-editorial-navy/40 sm:block">
            {nominationCount} filed this session
          </p>
        )}
      </div>
    </div>
  );
}