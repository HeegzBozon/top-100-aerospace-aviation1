import { B } from './journeyConfig';

// The five surfaces of the journey, cut as one instrument strip: Plan, Targets, Capture,
// Debrief, Follow up. The strip never wraps and never scrolls the page sideways on a
// phone — it takes a fifth of the width each and prints its index above the word.
export const JOURNEY_TABS = [
  { key: 'plan', label: 'Plan', index: '01' },
  { key: 'targets', label: 'Targets', index: '02' },
  { key: 'capture', label: 'Capture', index: '03' },
  { key: 'debrief', label: 'Debrief', index: '04' },
  { key: 'follow', label: 'Follow', index: '05' },
];

export default function JourneyTabs({ active, onChange, badges = {} }) {
  return (
    <div
      role="tablist"
      aria-label="The attendee journey"
      className="flex overflow-hidden rounded-sm"
      style={{ background: '#fff', border: `1px solid ${B.border}` }}
    >
      {JOURNEY_TABS.map((tab, i) => {
        const isActive = tab.key === active;
        const count = badges[tab.key];
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 transition-colors"
            style={i > 0 ? { boxShadow: `inset 1px 0 0 ${B.border}` } : undefined}
          >
            <span
              className="font-heading text-[8px] tracking-[0.06em]"
              style={{ color: isActive ? B.copper : B.muted }}
            >
              {tab.index}
            </span>
            <span
              className="truncate text-[9.5px] font-bold uppercase tracking-[0.1em]"
              style={{ color: isActive ? B.navy : B.muted }}
            >
              {tab.label}
            </span>
            {!!count && (
              <span
                className="absolute right-1.5 top-1 text-[8.5px] font-bold tabular-nums"
                style={{ color: B.copper }}
              >
                {count}
              </span>
            )}
            {isActive && (
              <span className="absolute inset-x-2 bottom-0 h-[2px]" style={{ background: B.copper }} />
            )}
          </button>
        );
      })}
    </div>
  );
}