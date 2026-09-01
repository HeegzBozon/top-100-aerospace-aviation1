import { Sparkles, ListOrdered } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

// Quiet segmented control that sits just under the HubListTabs on mobile.
// Lets a Fellow flip between the Nominate intake and the ranked My List
// surface without leaving the tab. Desktop uses the two-column split, so
// this is mobile-only.
export default function NominateViewToggle({ value, onChange, nominateCount = 0, listCount = 0 }) {
  const segments = [
    { key: 'nominate', label: 'Nominate', icon: Sparkles, count: nominateCount },
    { key: 'mylist', label: 'My List', icon: ListOrdered, count: listCount },
  ];

  return (
    <div className="lg:hidden px-4 pt-1 pb-2" style={{ background: brand.cream }}>
      <div
        className="max-w-md mx-auto flex items-center p-0.5 rounded-xl"
        style={{ background: `${brand.navy}05`, border: `1px solid ${brand.navy}0d` }}
      >
        {segments.map((s) => {
          const Icon = s.icon;
          const active = value === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onChange(s.key)}
              className="relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold transition-colors"
              style={{
                color: active ? brand.navy : `${brand.navy}45`,
                background: active ? 'white' : 'transparent',
                boxShadow: active ? '0 1px 4px rgba(30,58,90,0.08)' : 'none',
              }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: active ? brand.gold : `${brand.navy}35` }} />
              {s.label}
              {s.count > 0 && (
                <span
                  className="ml-0.5 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-bold"
                  style={{
                    background: active ? brand.gold : `${brand.navy}12`,
                    color: active ? 'white' : `${brand.navy}50`,
                  }}
                >
                  {s.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}