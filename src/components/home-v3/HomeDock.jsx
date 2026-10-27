import { useIsMobile } from "@/hooks/use-mobile";
import DesktopDock from "@/components/desktop/DesktopDock";

// Phones get the device from the app shell, which wraps every surface; the shelf is the
// desk's navigation and is drawn only where there is a desk to stand it on.
export default function HomeDock() {
  const isMobile = useIsMobile();
  if (isMobile) return null;
  return <DesktopDock />;
}