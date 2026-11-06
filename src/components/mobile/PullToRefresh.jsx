import { ArrowDown, Loader2 } from 'lucide-react';
import usePullToRefresh from '@/hooks/usePullToRefresh';

// The notice a thumb reads while it is pulling. Set at the head of the glass, inside
// the hardware's own measurements, and drawn only on a phone.
export default function PullToRefresh({ onRefresh }) {
  const { pull, refreshing, ready } = usePullToRefresh(onRefresh);
  const shown = refreshing || pull > 6;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[65] flex justify-center md:hidden"
      style={{
        top: 'calc(var(--hh-top, 28px) + var(--hh-nav, 34px) + env(safe-area-inset-top) + 8px)',
        opacity: shown ? 1 : 0,
        transition: 'opacity 160ms ease',
      }}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-editorial-copper/45 bg-editorial-cream/95 px-3 py-1.5 shadow-sm">
        {refreshing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-editorial-copper" />
        ) : (
          <ArrowDown
            className="h-3.5 w-3.5 text-editorial-copper transition-transform"
            style={{ transform: ready ? 'rotate(180deg)' : 'none' }}
          />
        )}
        <span className="font-body text-[10px] font-bold uppercase tracking-[0.16em] text-editorial-label">
          {refreshing ? 'Refreshing' : ready ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </span>
    </div>
  );
}