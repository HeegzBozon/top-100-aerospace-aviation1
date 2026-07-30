import { motion } from 'framer-motion';
import { Sparkles, ListOrdered } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

export default function HubListTabs({ activeTab, onTabChange, nominationCount, listCount }) {
  const tabs = [
    { key: 'nominate', label: 'Nominate', icon: Sparkles, badge: nominationCount },
    { key: 'list', label: 'My List', icon: ListOrdered, badge: listCount },
  ];

  return (
    <div className="sticky top-0 z-30 px-4 pt-2 pb-2.5" style={{ background: brand.cream }}>
      <div
        className="max-w-md mx-auto flex items-center gap-1 p-1 rounded-2xl"
        style={{ background: `${brand.navy}06`, border: `1px solid ${brand.navy}10` }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className="relative flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors"
              style={{ color: isActive ? brand.navy : `${brand.navy}50` }}
            >
              {isActive && (
                <motion.div
                  layoutId="hubListTab"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: 'white', border: `1px solid ${brand.navy}10`, boxShadow: '0 2px 8px rgba(30,58,90,0.08)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: isActive ? brand.gold : `${brand.navy}40` }} />
                {tab.label}
                {tab.badge > 0 && (
                  <span
                    className="ml-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      background: isActive ? brand.gold : `${brand.navy}10`,
                      color: isActive ? 'white' : `${brand.navy}50`,
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}