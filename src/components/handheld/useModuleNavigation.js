import { useCallback, useEffect, useRef, useState } from "react";

// The picture window — the one scrollable region inside the glass. The layout
// shell renders an inner scroller for page content; the stage is the fallback
// for surfaces that render their own.
export const getStage = () =>
  document.querySelector("[data-handheld-screen]") || document.querySelector(".hh-stage");

// How a surface lays its sections out. Most surfaces stack them down the glass,
// so back and forward on the ring step between them. A surface that pages
// sideways — the Board and its columns — marks the strip with data-hh-track, and
// back and forward cross it instead: breadth sideways, depth down.
const axisOf = () => {
  const stage = getStage();
  if (!stage) return null;
  const track = stage.querySelector("[data-hh-track]");
  return { stage, track, across: !!track };
};

const offsetIn = (element, axis) => {
  if (!axis.across) {
    return (
      element.getBoundingClientRect().top - axis.stage.getBoundingClientRect().top + axis.stage.scrollTop
    );
  }
  return (
    element.getBoundingClientRect().left - axis.track.getBoundingClientRect().left + axis.track.scrollLeft
  );
};

const markAt = (axis) =>
  axis.across
    ? axis.track.scrollLeft + Math.min(axis.track.clientWidth * 0.32, 200)
    : axis.stage.scrollTop + Math.min(axis.stage.clientHeight * 0.32, 200);

// Move a scroller by a detent's worth, and say whether it moved at all.
const nudge = (scroller, delta) => {
  const before = scroller.scrollTop;
  scroller.scrollTop = before + delta;
  return scroller.scrollTop !== before;
};

// The section you are actually reading, when a surface scrolls inside one of its
// sections rather than inside the glass — a Board column, say.
const innerScrollerAt = (stage) => {
  const spots = Array.from(stage.querySelectorAll("[data-hh-scroll]"));
  if (!spots.length) return null;
  const centre = stage.getBoundingClientRect().left + stage.clientWidth / 2;
  return (
    spots.find((el) => {
      const rect = el.getBoundingClientRect();
      return rect.left <= centre && rect.right >= centre;
    }) || null
  );
};

// Modules are whatever the surface marks with data-hh-module. Any surface that
// marks nothing simply has no modules.
export default function useModuleNavigation(locationKey) {
  const elsRef = useRef([]);
  const sigRef = useRef("");
  const [modules, setModules] = useState([]);
  const [index, setIndex] = useState(0);

  const collect = useCallback(() => {
    const axis = axisOf();
    if (!axis) return [];
    const scope = axis.across ? axis.track : axis.stage;
    const found = Array.from(scope.querySelectorAll("[data-hh-module]")).filter((el) =>
      axis.across ? el.offsetWidth > 4 : el.offsetHeight > 4,
    );
    elsRef.current = found;
    // Only report a change when the set of modules actually changed, so the
    // console's own chrome never bounces a re-render back through the observer.
    const signature = found.map((el) => el.dataset.hhModule).join("|");
    if (signature !== sigRef.current) {
      sigRef.current = signature;
      setModules(found.map((el) => ({ label: el.dataset.hhModule || "Section" })));
    }
    return found;
  }, []);

  const sync = useCallback(() => {
    const axis = axisOf();
    if (!axis || !elsRef.current.length) return;
    const mark = markAt(axis);
    let next = 0;
    elsRef.current.forEach((el, i) => {
      if (offsetIn(el, axis) <= mark) next = i;
    });
    setIndex(next);
  }, []);

  const goTo = useCallback(
    (target) => {
      const axis = axisOf();
      const els = elsRef.current.length ? elsRef.current : collect();
      const el = els[target];
      if (!axis || !el) return null;
      const offset = Math.max(0, offsetIn(el, axis) - 8);
      if (axis.across) axis.track.scrollTo({ left: offset, behavior: "smooth" });
      else axis.stage.scrollTo({ top: offset, behavior: "smooth" });
      setIndex(target);
      return target;
    },
    [collect],
  );

  const step = useCallback(
    (direction) => {
      const axis = axisOf();
      const els = collect();
      if (!axis || !els.length) return null;
      const mark = markAt(axis);
      let current = 0;
      els.forEach((el, i) => {
        if (offsetIn(el, axis) <= mark) current = i;
      });
      const target = current + direction;
      if (target < 0 || target >= els.length) return null;
      return goTo(target);
    },
    [collect, goTo],
  );

  // Depth: one section's own scroll where it has one, the glass next, the window
  // last — so the ring always moves whatever is actually in front of you. It reports
  // whether the surface moved at all: at the top or the bottom a turn must not be
  // swallowed in silence, so the console bumps instead.
  const scrollBy = useCallback((delta) => {
    const axis = axisOf();
    if (!axis) return false;
    const inner = innerScrollerAt(axis.stage);
    if (inner && inner.scrollHeight > inner.clientHeight + 4) return nudge(inner, delta);
    if (!axis.across && axis.stage.scrollHeight > axis.stage.clientHeight + 4) {
      return nudge(axis.stage, delta);
    }
    return nudge(document.scrollingElement || document.documentElement, delta);
  }, []);

  const jump = useCallback((direction) => {
    const axis = axisOf();
    if (!axis) return;
    if (axis.across) {
      axis.track.scrollBy({ left: direction * axis.track.clientWidth * 0.86, behavior: "smooth" });
      return;
    }
    axis.stage.scrollBy({ top: direction * axis.stage.clientHeight * 0.78, behavior: "smooth" });
  }, []);

  useEffect(() => {
    collect();
    sync();
  }, [collect, sync, locationKey]);

  useEffect(() => {
    const stage = getStage();
    if (!stage) return;

    // Scroll events do not bubble, but a capture listener on the document still
    // sees every nested scroller — so the wrong glass never goes stale.
    let frame = 0;
    const onScroll = (event) => {
      const axis = axisOf();
      if (!axis) return;
      const scroller = axis.across ? axis.track : axis.stage;
      if (event.target !== scroller) return;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };

    let timer = 0;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        collect();
        sync();
      }, 260);
    });

    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    observer.observe(stage, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      observer.disconnect();
      clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [collect, sync, locationKey]);

  return { modules, index, step, goTo, scrollBy, jump };
}