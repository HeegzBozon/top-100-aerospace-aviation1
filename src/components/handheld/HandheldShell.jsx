import { createContext, useContext, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import HandheldDeck from "./HandheldDeck";

// The device wraps the whole app: every surface renders inside the picture
// window and exactly one console is ever on screen. A layout that builds its
// own screen (the comms shell) finds itself inside and collapses to bare
// content instead of stacking a second device.
//
// A surface that needs the whole glass can put the console away while it does
// (the message composer does, so the keyboard has room). The device comes back
// the moment that surface stops asking.
const DeviceContext = createContext(null);

export const useDevice = () => useContext(DeviceContext);

export const useInsideDevice = () => {
  const device = useContext(DeviceContext);
  return !!device?.inside;
};

export default function HandheldShell() {
  const isMobile = useIsMobile();
  const [putAway, setPutAway] = useState(false);
  // Stable, so a surface reporting its state never re-triggers itself.
  const api = useMemo(() => ({ inside: true, setPutAway }), []);

  if (!isMobile) return <Outlet />;

  return (
    <DeviceContext.Provider value={api}>
      <div className="hh-stage md:hidden flex flex-col">
        <div
          data-handheld-screen="true"
          className="flex-1 min-h-0 overflow-y-auto scrollbar-hide flex flex-col"
          /* The glass base: the screen's own well tone, so a picture that does not
             reach an edge reads as the device's depth rather than as paper. */
          style={{ background: "var(--hh-well-2, #0A1220)" }}
        >
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
      {!putAway && <HandheldDeck />}
    </DeviceContext.Provider>
  );
}