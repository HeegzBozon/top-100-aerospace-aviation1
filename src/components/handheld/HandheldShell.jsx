import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import useKeyboardOpen from "@/hooks/useKeyboardOpen";
import useFieldIntoView from "@/hooks/useFieldIntoView";
import HandheldDeck from "./HandheldDeck";

// The device wraps the whole app: every surface renders inside the picture
// window and exactly one console is ever on screen. A layout that builds its
// own screen (the comms shell) finds itself inside and collapses to bare
// content instead of stacking a second device.
//
// A surface that needs the whole glass can put the console away while it does
// (the message composer does, so the keyboard has room). The device comes back
// the moment that surface stops asking.
//
// The keyboard is the other time the controls step aside, and the only one the
// reader does not ask for: the chin would sit behind the keys regardless, so it is
// hidden and the clearance it held is handed over to the keyboard — the picture
// steps down to meet the keys, and every bar and panel inside it is measured from
// them. The moulding stays where it is, so the device is still the device while a
// field is being written into.
const DeviceContext = createContext(null);

export const useDevice = () => useContext(DeviceContext);

export const useInsideDevice = () => {
  const device = useContext(DeviceContext);
  return !!device?.inside;
};

export default function HandheldShell() {
  const isMobile = useIsMobile();
  const [putAway, setPutAway] = useState(false);
  const keyboard = useKeyboardOpen();
  // Stable, so a surface reporting its state never re-triggers itself.
  const api = useMemo(() => ({ inside: true, setPutAway }), []);

  // The field being typed into is kept above the keys, inside the glass.
  useFieldIntoView(keyboard.open, keyboard.height);

  useEffect(() => {
    if (!isMobile || !keyboard.open) return undefined;

    const root = document.documentElement;
    document.body.classList.add("hh-keyboard");
    root.style.setProperty("--hh-keyboard", `${keyboard.height}px`);

    return () => {
      document.body.classList.remove("hh-keyboard");
      root.style.setProperty("--hh-keyboard", "0px");
    };
  }, [isMobile, keyboard.open, keyboard.height]);

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