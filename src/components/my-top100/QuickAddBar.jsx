import { Plus } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';

// Bottom-anchored quick-add affordance for the mobile Nominate tab.
// Fixed position so nominating is always one thumb-tap, regardless of
// scroll or which in-tab side is active. Reserves the iOS safe area and
// fades its top edge into the cream surface so content scrolls under it.
export default function QuickAddBar({ onClick, hidden = false }) {
  if (hidden) return null;
  return (
    <div
      className="lg:hidden fixed left-0 right-0 bottom-0 z-40 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      style={{ background: `linear-gradient(to top, ${brand.cream} 78%, ${brand.cream}00)` }}
    >
      <button
        onClick={onClick}
        className="w-full max-w-md mx-auto flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[15px] font-bold text-white shadow-lg active:scale-[0.99] transition-transform"
        style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
      >
        <Plus className="w-4 h-4" />
        Nominate someone
      </button>
    </div>
  );
}