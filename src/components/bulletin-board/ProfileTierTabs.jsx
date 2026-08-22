import { useState } from 'react';
import { Plane, CreditCard } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Profile tier: sub-tabs for credential modules.
// Flightography (career, education, skills, stats) and Trading Card (card + theme).
export default function ProfileTierTabs({ flightography, tradingCard, accent }) {
  const [tab, setTab] = useState('flightography');
  const tabs = [
    { key: 'flightography', label: 'Flightography', icon: Plane },
    { key: 'tradingCard', label: 'Trading Card', icon: CreditCard },
  ];
  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div
        className="flex items-center gap-1 rounded-full p-1 w-fit max-w-full overflow-x-auto scrollbar-hide"
        style={{ background: B.cream, border: `1px solid ${B.border}` }}
      >
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-colors shrink-0 whitespace-nowrap"
            style={{ background: tab === key ? B.navy : 'transparent', color: tab === key ? '#fff' : B.muted }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: tab === key ? '#fff' : accent }} />
            {label}
          </button>
        ))}
      </div>
      <div className="space-y-5">
        {tab === 'flightography' && flightography}
        {tab === 'tradingCard' && tradingCard}
      </div>
    </div>
  );
}