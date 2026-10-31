import { C } from '@/components/crm/crmConfig';

// The leaf inside a leaf. A tab that holds more than one kind of paper prints the sections
// underneath the tab row, so the stand stays three keys wide however much it carries. Each
// section prints its own count.
export default function NewsstandSubTabs({ tabs = [], activeKey, onSelect }) {
  if (!tabs.length) return null;

  return (
    <div role="tablist" aria-label="Sections" className="mt-3 flex flex-wrap items-center gap-1.5">
      {tabs.map((tab) => {
        const on = tab.key === activeKey;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(tab.key)}
            className="flex items-baseline gap-1.5 rounded-[2px] px-2.5 py-1.5 text-[8.5px] font-bold uppercase tracking-[0.2em] md:text-[9.5px]"
            style={{
              color: on ? C.cream : C.navy,
              background: on ? C.navy : 'transparent',
              border: `1px solid ${on ? C.navy : C.border}`,
              transition: 'background-color 160ms ease, color 160ms ease',
            }}
          >
            <span>{tab.label}</span>
            <span
              className="font-heading text-[10px] leading-none tabular-nums"
              style={{ color: on ? C.gold : C.copper }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}