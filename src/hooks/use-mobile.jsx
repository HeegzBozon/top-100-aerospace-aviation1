import * as React from "react"
import { LANDSCAPE_QUERY, readLandscape } from "@/hooks/useLandscapeHandheld"

const MOBILE_BREAKPOINT = 768

// Answered on the first render rather than after an effect: the device is built
// from this on a phone, and a page that renders once as a desktop before snapping
// into the glass shows the wrong thing for a frame.
// A phone held sideways is still the handheld, just turned: it gets the PSP face.
function readViewport() {
  if (typeof window === "undefined") return false
  return window.innerWidth < MOBILE_BREAKPOINT || readLandscape()
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(readViewport)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const land = window.matchMedia(LANDSCAPE_QUERY)
    const onChange = () => setIsMobile(readViewport())
    mql.addEventListener("change", onChange)
    land.addEventListener("change", onChange)
    onChange()
    return () => { mql.removeEventListener("change", onChange); land.removeEventListener("change", onChange) };
  }, [])

  return !!isMobile
}