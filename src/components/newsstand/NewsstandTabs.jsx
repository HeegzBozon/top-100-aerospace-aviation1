import { C } from '@/components/crm/crmConfig';

// The stand's three leaves: the volumes you take away, the issues mailed out of them, and the
// notes the house keeps by the door. Each leaf prints its own count, so the weight of a tab is
// legible before it is opened.
export default function NewsstandTabs({ tabs = [], activeKey, onSelect }) {
  return (
    <div
      role="tablist"
      aria-label="The Newsstand"
      className="mt-6 flex items-stretch"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      {tabs.map((tab) => {
        const on = tab.key === activeKey;

        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(tab.key)}
            className="relative -mb-px flex flex-1 items-baseline justify-center gap-2 px-2 pb-2.5 pt-1 text-[8.5px] font-bold uppercase tracking-[0.24em] md:text-[10px]"
            style={{
              color: on ? C.navy : C.muted,
              boxShadow: on ? `inset 0 -2px 0 ${C.copper}` : undefined,
              transition: 'color 160ms ease',
            }}
          >
            <span>{tab.label}</span>
            <span
              className="font-heading text-[10px] leading-none tabular-nums"
              style={{ color: on ? C.copper : 'rgba(30,58,90,0.32)' }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}