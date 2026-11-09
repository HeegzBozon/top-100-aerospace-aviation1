import { Outlet, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDevice } from "@/components/handheld/HandheldShell";
import ImacHousing from "./ImacHousing";
import DesktopDock from "./DesktopDock";
import { standsBackOnDesk } from "@/components/shell/immersiveSurfaces";

// Which surfaces own the whole tube — a game driven from its own instrument panel, a
// session running live, a magazine spread being read — is declared once, in
// components/shell/immersiveSurfaces, so the desk and the glass answer from one policy.
// The shelf stands back from those surfaces here; the glass keeps its console, because the
// console is the machine and not furniture laid over the picture.

// Every desktop surface renders inside one retro console: a translucent shell in
// one of the classic colours, the bands that wrap the tube, and the tube the whole
// platform is seen through. A phone is left entirely to the handheld — the two
// machines are never on the same desk at once.
//
// The shelf is part of the desk, not of any one surface: it is drawn here, once,
// beside the machine, so every page the tube shows is a page a hand can leave.
export default function DesktopShell() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  // The one key on the picture lifts the machinery away — the same key, and the same
  // state, as the handheld's: put the machine down and the surface stands on its own.
  const { hardwareOn } = useDevice() || {};

  if (isMobile) return <Outlet />;
  // With the case down the surface stands on the desk itself, still in a measured seat
  // of the whole window — a surface that fills its picture keeps filling it.
  if (hardwareOn === false) {
    return (
      <div className="imac-bare">
        <Outlet />
      </div>
    );
  }

  const bare = standsBackOnDesk(pathname);

  return (
    <>
      <ImacHousing shelf={bare ? null : <DesktopDock />}>
        <Outlet />
      </ImacHousing>
    </>
  );
}