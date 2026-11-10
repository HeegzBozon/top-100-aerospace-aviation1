import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
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
  const toggleHardware = useCallback(() => {
    if (isMobile) {
      blip(hardwareOn ? "toggle" : "select");
      buzz();
    }
    setHardwareOn((on) => !on);
  }, [hardwareOn, isMobile]);

  // Stable, so a surface reporting its state never re-triggers itself. The toggle is
  // handed on, because it is now the bar's View menu that puts the machine down as well
  // as the key that brings it back.
  const api = useMemo(
    () => ({ inside: true, setPutAway, hardwareOn, toggleHardware }),
    [hardwareOn, toggleHardware],
  );
  // The desk answers from the same state, without claiming to be the device.
  const deskApi = useMemo(
    () => ({ inside: false, hardwareOn, toggleHardware }),
    [hardwareOn, toggleHardware],
  );

  // The Colony is the one room the machine is worn in full, so the case comes up on
  // entering it. The key still lowers it while standing there, and whatever the reader
  // chose travels out of the room with them.
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.toLowerCase().startsWith("/colony")) setHardwareOn(true);
  }, [location.pathname]);

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

  // A surface that clears the glass for a field (the Comms composer) still leaves the key
  // standing — it is the machine's own control, not the surface's — so the body carries the
  // fact and the key's own stylesheet seats it clear of the field rather than over it.
  useEffect(() => {
    if (!isMobile || !putAway) return undefined;
    document.body.classList.add("hh-put-away");
    return () => document.body.classList.remove("hh-put-away");
  }, [isMobile, putAway]);

  if (!isMobile) {
    return (
      <DeviceContext.Provider value={deskApi}>
        <Outlet />
        {/* Putting the machine down is a press in the bar's View menu; with the tube and
            its bar gone, this key is the only thing left that can bring them back. */}
        {hardwareOn ? null : <DeckPowerKey standing={false} onToggle={toggleHardware} />}
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
        <HandheldDeck deckOn={hardwareOn} onPutAway={toggleHardware} />
      )}
      {/* The case is put down from the bar's View menu, and the bar is cut into the chin —
          so while the machine is away this key is the only control on the picture, and
          the way back to the menu that lowered it. */}
      {hardwareOn ? null : <DeckPowerKey standing={false} onToggle={toggleHardware} />}
    </DeviceContext.Provider>
  );
}