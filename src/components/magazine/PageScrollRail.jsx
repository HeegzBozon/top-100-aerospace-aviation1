import { useEffect, useRef, useState } from 'react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import { PAGE_SCROLL_ATTR } from '@/components/magazine/pageTeleprompter';

// A page's own measure.
//
// The browser's scroll bar is a piece of the operating system laid over the paper, and it
// prints its grey trough down the trim of every page that runs past its frame. So the page
// carries no scroll bar of its own (see .page-scroll) and wears this instead: a slim
// copper rule at the trim, filled as far as the page has been read, with a lit bead at the
// leading edge and the page's own measure printed under it. It is an instrument, not a
// control — nothing here is dragged; the page is rolled with the wheel, a thumb or the
// film, and this only says how far it has gone.
//
// Mount it as a child of the frame the page is drawn in: it finds the page's scroller
// inside that frame, so a spread can carry one measure on the left page and another on the
// right, each reading its own roll.
export default function PageScrollRail({ pageKey, tone = 'paper' }) {
  const ref = useRef(null);
  const [measure, setMeasure] = useState({ ratio: 0, rolling: false });

  useEffect(() => {
    const host = ref.current?.parentElement;
    const el = host?.querySelector(`[${PAGE_SCROLL_ATTR}]`);
    if (!el) {
      setMeasure({ ratio: 0, rolling: false });
      return undefined;
    }

    let frame = 0;
    const read = () => {
      frame = 0;
      const span = el.scrollHeight - el.clientHeight;
      const rolling = span > 6;
      const ratio = rolling ? Math.min(1, Math.max(0, el.scrollTop / span)) : 0;
      setMeasure((prev) => (
        prev.rolling === rolling && Math.abs(prev.ratio - ratio) < 0.004 ? prev : { ratio, rolling }
      ));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    el.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('scroll', schedule);
      observer.disconnect();
    };
  }, [pageKey]);

  if (!measure.rolling) return null;

  const night = tone === 'night';
  const fill = Math.max(measure.ratio * 100, 4);

  return (
    <div
      className="pointer-events-none absolute bottom-0 right-0.5 top-0 z-10 flex w-2.5 flex-col items-center justify-center"
      aria-hidden="true"
    >
      <div
        className="relative w-[3px] overflow-hidden rounded-full"
        style={{
          height: '52%',
          background: night ? 'rgba(250,248,245,0.16)' : 'rgba(143,92,44,0.16)',
          boxShadow: night ? 'none' : 'inset 0 0 0 1px rgba(143,92,44,0.10)',
        }}
      >
        <div
          className="absolute inset-x-0 top-0 rounded-full"
          style={{
            height: `${fill}%`,
            background: 'linear-gradient(180deg, #E8CF9E 0%, #C9A87C 46%, #B87333 100%)',
            boxShadow: '0 0 7px rgba(201,168,124,0.55)',
            transition: 'height 90ms linear',
          }}
        />
        <span
          className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
          style={{
            top: `calc(${fill}% - 3px)`,
            background: P.cream,
            boxShadow: '0 0 8px rgba(232,207,158,0.9)',
            transition: 'top 90ms linear',
          }}
        />
      </div>
      <span
        className="mt-1 text-[6.5px] font-bold tabular-nums"
        style={{ color: night ? 'rgba(250,248,245,0.55)' : 'rgba(143,92,44,0.7)' }}
      >
        {Math.round(measure.ratio * 100)}
      </span>
    </div>
  );
}