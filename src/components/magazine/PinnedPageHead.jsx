import React, { useEffect, useRef, useState } from 'react';
import { MAGAZINE_PALETTE as P, PORTRAIT_FOCUS } from '@/components/magazine/magazineConfig';
import { PAGE_SCROLL_ATTR } from '@/components/magazine/pageTeleprompter';

// The page's head, pinned to the top of the frame.
//
// A magazine pins its running head so a reader never loses what they are standing in.
// Here it is the page's own head that pins — the region, the name, the stand — set on the
// page's own tone with a hairline beneath it, so the body can run under it without the
// type fighting what passes below.
//
// When the page carries a portrait, the banner is never lost either: it collapses into a
// seal beside the head the moment the reader begins to scroll, and opens back out of it
// at the top of the page.
export default function PinnedPageHead({ children, portraitUrl, className = '' }) {
  const bandRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scroller = bandRef.current?.closest(`[${PAGE_SCROLL_ATTR}]`);
    if (!scroller) return undefined;
    const onScroll = () => setScrolled(scroller.scrollTop > 24);
    onScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => scroller.removeEventListener('scroll', onScroll);
  }, [portraitUrl]);

  return (
    <div
      ref={bandRef}
      className={`sticky top-0 z-20 pb-2.5 pt-3 ${className}`}
      style={{
        background: 'rgba(250,248,245,0.93)',
        backdropFilter: 'blur(7px)',
        WebkitBackdropFilter: 'blur(7px)',
        borderBottom: '1px solid rgba(30,58,90,0.12)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 [&>*:last-child]:mb-0">{children}</div>
        {portraitUrl && (
          <img
            src={portraitUrl}
            alt=""
            aria-hidden={!scrolled}
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
            className="h-8 w-8 flex-none rounded-full object-cover transition-opacity duration-300"
            style={{ ...PORTRAIT_FOCUS, opacity: scrolled ? 1 : 0, border: `1px solid ${P.gold}80` }}
          />
        )}
      </div>
    </div>
  );
}