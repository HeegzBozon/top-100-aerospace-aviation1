import { createContext, useContext } from "react";
import { Outlet } from "react-router-dom";

// The hardware is retired: there is no case, no bezel, no chin and no console over the
// picture. Every surface renders into the full width and height of the viewport, in the
// document's own flow, so a page scrolls the way a page scrolls.
//
// The device context survives only for the one surface that asked the console to step
// aside while a message was being written (Comms). With no provider above it, it reads
// as absent and that surface simply never asks.
const DeviceContext = createContext(null);

export const useDevice = () => useContext(DeviceContext);

export const useInsideDevice = () => {
  const device = useContext(DeviceContext);
  return !!device?.inside;
};

export default function HandheldShell() {
  return <Outlet />;
}