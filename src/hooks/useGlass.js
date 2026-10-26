import { useEffect, useState } from "react";

// The glass, as the device draws it: the same breakpoint the shell uses to put
// the console under the content. It is read synchronously, so a surface built
// for the glass never renders its desk layout first and remounts a frame later.
const QUERY = "(max-width: 767px)";

export default function useGlass() {
  const [glass, setGlass] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const onChange = (event) => setGlass(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return glass;
}