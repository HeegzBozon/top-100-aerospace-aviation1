import { useCallback, useEffect, useRef, useState } from "react";

// The picture window — the one scrollable region inside the glass. The layout
// shell renders an inner scroller for page content; the stage is the fallback
// for surfaces that render their own.
export const getStage = () =>
  document.querySelector("[data-handheld-screen]") || document.querySelector(".hh-stage");

const offsetIn = (stage, element) =>
  element.getBoundingClientRect().top - stage.getBoundingClientRect().top + stage.scrollTop;

// Modules are whatever the surface marks with data-hh-module. The wheel's back
// and forward zones step between them; the rail shows where you stand. Any
// surface that marks nothing simply has no modules.
export default function useModuleNavigation(locationKey) {
  const elsRef = useRef([]);
  const sigRef = useRef("");
  const [modules, setModules] = useState([]);
  const [index, setIndex] = useState(0);

  const collect = useCallback(() => {
    const stage = getStage();
    if (!stage) return [];
    const found = Array.from(stage.querySelectorAll("[data-hh-module]")).filter((el) => el.offsetHeight > 4);
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

  const markerIn = (stage) => stage.scrollTop + Math.min(stage.clientHeight * 0.32, 200);

  const sync = useCallback(() => {
    const stage = getStage();
    if (!stage || !elsRef.current.length) return;
    const mark = markerIn(stage);
    let next = 0;
    elsRef.current.forEach((el, i) => {
      if (offsetIn(stage, el) <= mark) next = i;
    });
    setIndex(next);
  }, []);

  const goTo = useCallback((target) => {
    const stage = getStage();
    const els = elsRef.current.length ? elsRef.current : collect();
    const el = els[target];
    if (!stage || !el) return null;
    stage.scrollTo({ top: Math.max(0, offsetIn(stage, el) - 8), behavior: "smooth" });
    setIndex(target);
    return target;
  }, [collect]);

  const step = useCallback(
    (direction) => {
      const els = collect();
      const stage = getStage();
      if (!els.length || !stage) return null;
      const mark = markerIn(stage);
      let current = 0;
      els.forEach((el, i) => {
        if (offsetIn(stage, el) <= mark) current = i;
      });
      const target = current + direction;
      if (target < 0 || target >= els.length) return null;
      return goTo(target);
    },
    [collect, goTo],
  );

  const jump = useCallback(
    (direction) => {
      const stage = getStage();
      if (!stage) return;
      stage.scrollBy({ top: direction * stage.clientHeight * 0.78, behavior: "smooth" });
    },
    [],
  );

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
      if (event.target !== getStage()) return;
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

  return { modules, index, step, goTo, jump };
}