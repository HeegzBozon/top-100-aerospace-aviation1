import { brand } from '@/components/nominate/NominateConfig';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'women', label: 'Women' },
  { key: 'men', label: 'Men' },
  { key: 'angels', label: 'Angels' },
];

export default function ListCategoryTabs({ activeTab, onTabChange, counts = {} }) {
  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="relative shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition-colors"
              style={{
                background: isActive ? brand.navy : `${brand.navy}08`,
                color: isActive ? 'white' : `${brand.navy}70`,
              }}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    background: isActive ? brand.gold : `${brand.navy}12`,
                    color: isActive ? 'white' : `${brand.navy}60`,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}