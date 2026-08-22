import { PenLine, ListOrdered, Plane, CreditCard } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Journey spine — four verbs in the order a Fellow earns their place:
// Compose (speaks) → The Eight (chooses) → Flightography (proves) → Card (recognized).
// Replaces the Author/Profile two-tier toggle.
const TABS = [
  { key: 'compose', label: 'Compose', icon: PenLine },
  { key: 'eight', label: 'The Eight', icon: ListOrdered },
  { key: 'flightography', label: 'Flightography', icon: Plane },
  { key: 'card', label: 'Card', icon: CreditCard },
];

export default function JourneyTabs({ tab, onChange, accent }) {
  return (
    <div
      className="flex items-center gap-1 rounded-full p-1 w-fit max-w-full overflow-x-auto scrollbar-hide"
      style={{ background: B.cream, border: `1px solid ${B.border}` }}
    >
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em] transition-colors shrink-0 whitespace-nowrap"
          style={{ background: tab === key ? B.navy : 'transparent', color: tab === key ? '#fff' : B.muted }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: tab === key ? '#fff' : accent }} />
          {label}
        </button>
      ))}
    </div>
  );
}