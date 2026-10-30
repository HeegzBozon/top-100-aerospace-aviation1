import { Outlet } from "react-router-dom";
import DesktopMenuBar from "./DesktopMenuBar";

// No machine, no tube, no shelf: one menu bar across the head of the document and the
// surface at the full width of the window, on every size of screen.
export default function DesktopShell() {
  return (
    <>
      <DesktopMenuBar />
      <Outlet />
    </>
  );
}