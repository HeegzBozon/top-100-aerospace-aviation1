import { PenLine, Award } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Top-tier toggle for the instrument cluster's 70% pane.
// Author = authored content (dispatches, notes, gallery).
// Profile = credential modules (flightography, trading card).
export default function ClusterTierToggle({ tier, onChange, accent }) {
  const tiers = [
    { key: 'author', label: 'Author', icon: PenLine },
    { key: 'profile', label: 'Profile', icon: Award },
  ];
  return (
    <div
      className="flex items-center gap-1 rounded-full p-1 w-fit"
      style={{ background: B.cream, border: `1px solid ${B.border}` }}
    >
      {tiers.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap"
          style={{ background: tier === key ? B.navy : 'transparent', color: tier === key ? '#fff' : B.muted }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: tier === key ? '#fff' : accent }} />
          {label}
        </button>
      ))}
    </div>
  );
}