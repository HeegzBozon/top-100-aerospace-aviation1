import React from 'react';

// The measure of the ladder, cut as one hairline across the head of the set: a recessed
// track, a copper-into-rose-gold fill, and a single sheen crossing it. The fill moves by
// transform only, so it never re-lays the page while a review is being filed.
export default function ReviewProgressStrip({ progress = 0, label = null }) {
  const pct = Math.max(0, Math.min(1, Number(progress) || 0));
  return (
    <div className="mb-1.5 shrink-0 md:mb-3" aria-label={label || 'Progress to the next rung'}>
      <div className="relative h-[3px] overflow-hidden rounded-full bg-editorial-navy/10">
        <div
          className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-editorial-copper via-editorial-gold to-editorial-sand transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{ transform: `scaleX(${Math.max(pct, 0.02)})` }}
        >
          <span className="rpm-sheen absolute inset-y-0 left-0 w-1/3" />
        </div>
      </div>
      <div className="pointer-events-none relative -mt-[3px] h-[3px]" aria-hidden>
        <span
          className="absolute top-1/2 transition-[left] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-editorial-gold shadow-[0_0_8px_2px_rgb(var(--editorial-gold-rgb)/0.7)]"
          style={{ left: `${Math.max(pct, 0.02) * 100}%` }}
        />
      </div>
    </div>
  );
}