import { Outlet, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ImacHousing from "./ImacHousing";
import DesktopDock from "./DesktopDock";

// The surfaces that own the whole tube: a game driven from its own instrument panel, a
// session running live, a magazine spread being read. The shelf stands back from these,
// so nothing of the machine sits over the thing being operated.
const FULL_BLEED = [
  /^\/play\b/,
  /^\/aero-frontier\b/,
  /^\/common-ground\b/,
  /^\/session-portal\b/,
  /^\/magazine\//,
];

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

  if (isMobile) return <Outlet />;

  const bare = FULL_BLEED.some((pattern) => pattern.test(pathname));

  return (
    <>
      <ImacHousing>
        <Outlet />
      </ImacHousing>
      {bare ? null : <DesktopDock />}
    </>
  );
}