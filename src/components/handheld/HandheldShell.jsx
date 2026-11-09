import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import useKeyboardOpen from "@/hooks/useKeyboardOpen";
import useFieldIntoView from "@/hooks/useFieldIntoView";
import HandheldDeck from "./HandheldDeck";
import DeckPowerKey from "./DeckPowerKey";
import { blip, buzz } from "./handheldSound";
import useOverlayPicker from "./useOverlayPicker";

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
  // Whether the machine's hardware is standing on the picture. The key that carries this
  // is never put away with the case, so the state lives here rather than in the deck: the
  // deck is what the key lowers.
  const [hardwareOn, setHardwareOn] = useState(true);
  const keyboard = useKeyboardOpen();
  // Stable, so a surface reporting its state never re-triggers itself.
  const api = useMemo(() => ({ inside: true, setPutAway, hardwareOn }), [hardwareOn]);
  // The desk answers from the same state, without claiming to be the device.
  const deskApi = useMemo(() => ({ inside: false, hardwareOn }), [hardwareOn]);

  const toggleHardware = useCallback(() => {
    if (isMobile) {
      blip(hardwareOn ? "toggle" : "select");
      buzz();
    }
    setHardwareOn((on) => !on);
  }, [hardwareOn, isMobile]);

  // The field being typed into is kept above the keys, inside the glass.
  useFieldIntoView(keyboard.open, keyboard.height);

  // A panel standing over the picture — a sheet, a menu, a form — hands the ring and
  // the keypad to its own controls, so the machine keeps working while it is open.
  useOverlayPicker(isMobile);

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

  if (!isMobile) {
    return (
      <DeviceContext.Provider value={deskApi}>
        <Outlet />
        {/* The one key on the desk's picture: it lifts the machinery away and puts it back. */}
        <DeckPowerKey standing={hardwareOn} onToggle={toggleHardware} />
      </DeviceContext.Provider>
    );
  }

  return (
    <DeviceContext.Provider value={api}>
      <div className="hh-stage md:hidden flex flex-col overscroll-y-none">
        <div
          data-handheld-screen="true"
          className="flex-1 min-h-0 overflow-y-auto overscroll-y-none scrollbar-hide flex flex-col"
          /* The glass base: the screen's own well tone, so a picture that does not
             reach an edge reads as the device's depth rather than as paper. */
          style={{ background: "var(--hh-well-2, #0A1220)" }}
        >
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
      {!putAway && hardwareOn && (
        <HandheldDeck deckOn={hardwareOn} onToggle={toggleHardware} />
      )}
      {!putAway && <DeckPowerKey standing={hardwareOn} onToggle={toggleHardware} />}
    </DeviceContext.Provider>
  );
}