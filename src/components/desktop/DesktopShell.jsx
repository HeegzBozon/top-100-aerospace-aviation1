import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ImacHousing from "./ImacHousing";

// Every desktop surface renders inside one retro console: a translucent shell in
// one of the classic colours, the bands that wrap the tube, and the tube the whole
// platform is seen through. A phone is left entirely to the handheld — the two
// machines are never on the same desk at once.
export default function DesktopShell() {
  const isMobile = useIsMobile();

  if (isMobile) return <Outlet />;

  return (
    <ImacHousing>
      <Outlet />
    </ImacHousing>
  );
}