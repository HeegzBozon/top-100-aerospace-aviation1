import { B } from '@/components/fellow-home/fellowHomeConfig';

// A single horizontal swim lane: label + count header, then a horizontally
// scrollable row of room cards. Cards are wrapped in a fixed-width slot so
// the lane reads as a row, not a wrapping grid.
export default function ConferenceSwimLane({ label, dot, count, emptyHint, children }) {
  const arr = Array.isArray(children) ? children : [children];
  const cards = arr.filter(Boolean);
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>{label}</span>
        </div>
        <span className="text-[10px] font-semibold rounded-full px-1.5" style={{ background: B.cream, color: B.muted }}>{count}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 min-h-[80px]">
        {cards.length === 0 ? (
          <div className="rounded-lg p-3 text-center text-[11px] italic w-full" style={{ border: `1px dashed ${B.border}`, color: B.muted }}>
            {emptyHint}
          </div>
        ) : (
          cards.map((card, i) => (
            <div key={i} className="shrink-0 w-[260px] max-w-[260px]">
              {card}
            </div>
          ))
        )}
      </div>
    </div>
  );
}