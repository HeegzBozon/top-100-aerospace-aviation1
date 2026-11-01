import { useEffect, useState } from "react";

// A phone turned on its side: touch, wide, and short. Held like a PSP.
export const LANDSCAPE_QUERY = "(orientation: landscape) and (max-height: 500px) and (pointer: coarse)";

export function readLandscape() {
  return typeof window !== "undefined" && !!window.matchMedia?.(LANDSCAPE_QUERY).matches;
}

export default function useLandscapeHandheld() {
  const [on, setOn] = useState(readLandscape);
  useEffect(() => {
    const mql = window.matchMedia(LANDSCAPE_QUERY);
    const onChange = () => setOn(mql.matches);
    mql.addEventListener("change", onChange);
    onChange();
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return on;
}