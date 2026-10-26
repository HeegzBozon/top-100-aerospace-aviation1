import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { registerDeck, touchDeck } from "./handheldDeck";

const GLASS = "(max-width: 767px)";
// A section shorter than this has nothing on it at this viewport, so it is
// dropped from the deck rather than shown as a blank page.
const EMPTY_HEIGHT = 90;

const useGlass = () => {
  const [glass, setGlass] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(GLASS).matches,
  );
  useEffect(() => {
    const query = window.matchMedia(GLASS);
    const onChange = (event) => setGlass(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return glass;
};

// A publication the glass can page through sideways: one full-height slide per
// section, scrolling inside itself. The deck registers with the console, so the
// wheel's back and forward turn the page, play reads a section and turns on, and
// any in-page anchor (#manifesto, the contents list) lands on its own slide.
// Desktop keeps the plain vertical flow — same sections, one column.
export default function ModuleSlideDeck({ slides = [] }) {
  const glass = useGlass();
  const stripRef = useRef(null);
  const slideRefs = useRef([]);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [dropped, setDropped] = useState(() => new Set());

  const signature = useMemo(() => slides.map((slide) => slide.key).join("|"), [slides]);

  const entries = useMemo(
    () => slides.filter((slide) => !dropped.has(slide.key)),
    [slides, dropped],
  );
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const goTo = useCallback((target) => {
    const strip = stripRef.current;
    const total = entriesRef.current.length;
    if (!strip || !total) return;
    const next = Math.max(0, Math.min(total - 1, target));
    strip.scrollTo({ left: next * strip.clientWidth, behavior: "smooth" });
  }, []);

  // The console's handle on the deck. Methods read the refs, so the handle is
  // created once and stays valid as the page grows.
  const api = useRef(null);
  if (!api.current) {
    const activeSlide = () => stripRef.current?.querySelector("[data-hh-slide-active]");
    api.current = {
      labels: () => entriesRef.current.map((slide) => slide.label),
      count: () => entriesRef.current.length,
      index: () => indexRef.current,
      next: () => goTo(indexRef.current + 1),
      prev: () => goTo(indexRef.current - 1),
      goTo: (i) => goTo(i),
      scrollBy: (delta) => {
        const slide = activeSlide();
        if (slide) slide.scrollTop += delta;
      },
      atEnd: () => {
        const slide = activeSlide();
        if (!slide) return true;
        return slide.scrollTop >= slide.scrollHeight - slide.clientHeight - 2;
      },
    };
  }

  // Sections that render nothing at this viewport are dropped from the deck.
  useEffect(() => {
    if (!glass) return undefined;
    const measure = () => {
      const next = new Set();
      slideRefs.current.forEach((node, i) => {
        const slide = slides[i];
        if (slide && node && node.getBoundingClientRect().height < EMPTY_HEIGHT) next.add(slide.key);
      });
      setDropped((prev) => (prev.size === next.size ? prev : next));
    };
    const frame = requestAnimationFrame(measure);
    const timer = setTimeout(measure, 1200);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [glass, signature, slides]);

  // Fill whatever glass is left under anything the surface renders above the
  // deck (a member header, say), so a slide is always exactly one screen.
  useEffect(() => {
    if (!glass) return undefined;
    const strip = stripRef.current;
    if (!strip) return undefined;
    const fit = () => {
      const stage = strip.closest(".hh-stage");
      if (!stage) return;
      const room = stage.getBoundingClientRect().bottom - strip.getBoundingClientRect().top;
      strip.style.height = `${Math.round(Math.max(240, room))}px`;
    };
    // Coalesced to a frame: the strip sets its own height and the observer watches
    // the surface around it, so measuring and writing inside the notification is how
    // a resize loop starts. The write lands after the browser has finished telling
    // observers about the last one.
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        fit();
      });
    };
    fit();
    schedule();
    const observer = new ResizeObserver(schedule);
    if (strip.parentElement) observer.observe(strip.parentElement);
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [glass, signature]);

  // Hand the deck to the console, and keep it told where we are.
  useEffect(() => {
    if (!glass || !entries.length) return undefined;
    return registerDeck(api.current);
  }, [glass, entries.length]);

  useEffect(() => {
    indexRef.current = index;
    touchDeck();
  }, [index, entries.length, glass]);

  // Realign after a rotation: one slide is always exactly one strip width.
  useEffect(() => {
    const onResize = () => {
      const strip = stripRef.current;
      if (strip) strip.scrollLeft = indexRef.current * strip.clientWidth;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // A deep link into a section opens on that section's slide.
  useEffect(() => {
    if (!glass || !entries.length) return;
    const id = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!id) return;
    const target = entriesRef.current.findIndex((slide) => slide.id === id);
    if (target > 0) requestAnimationFrame(() => goTo(target));
  }, [glass, entries.length, goTo]);

  // Tapping an in-page anchor moves the deck rather than hunting for a scroll
  // target that lives on another slide.
  const onAnchorClick = useCallback(
    (event) => {
      const link = event.target?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = decodeURIComponent(link.getAttribute("href").slice(1));
      if (!id) return;
      const target = entriesRef.current.findIndex((slide) => slide.id === id);
      if (target < 0) return;
      event.preventDefault();
      goTo(target);
    },
    [goTo],
  );

  const onScroll = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const width = strip.clientWidth || 1;
    const next = Math.round(strip.scrollLeft / width);
    if (next !== indexRef.current) {
      indexRef.current = next;
      setIndex(next);
      touchDeck();
    }
  }, []);

  if (!glass) {
    return (
      <>
        {slides.map((slide) => (
          <Fragment key={slide.key}>{slide.content}</Fragment>
        ))}
      </>
    );
  }

  const activeKey = entries[index]?.key;

  return (
    <div
      ref={stripRef}
      onScroll={onScroll}
      onClickCapture={onAnchorClick}
      className="hh-slide-window relative z-[1] flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden scrollbar-hide"
      aria-label="Sections"
    >
      {slides.map((slide, i) => (
        <section
          key={slide.key}
          ref={(node) => {
            slideRefs.current[i] = node;
          }}
          data-hh-slide-active={slide.key === activeKey ? "true" : undefined}
          aria-label={slide.label}
          className={`hh-slide h-full w-full shrink-0 snap-start overflow-y-auto scrollbar-hide ${
            dropped.has(slide.key) ? "hidden" : ""
          }`}
        >
          {slide.content}
        </section>
      ))}
    </div>
  );
}