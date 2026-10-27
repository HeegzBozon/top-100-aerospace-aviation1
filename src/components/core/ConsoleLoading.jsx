import { useLayoutEffect } from "react";
import { applyShellVars, releaseShellVars } from "@/components/handheld/handheldGeometry";
import HandheldBody from "@/components/handheld/HandheldBody";
import HandheldScreenFrame from "@/components/handheld/HandheldScreenFrame";
import HandheldChin from "@/components/handheld/HandheldChin";
import ImacHousing from "@/components/desktop/ImacHousing";
import ImacWait from "@/components/desktop/ImacWait";

// The app's loading state, console first.
//
// The case is painted immediately — body, moulding, chin — and the wait
// happens inside the glass, where a surface will be. Nothing here reaches over the
// hardware, so the device is present from the first frame and the picture simply
// fills in underneath it. A desktop has no device, so there it is a plain wait.
export default function ConsoleLoading({ label = "Powering up" }) {
  useLayoutEffect(() => {
    applyShellVars();
    return releaseShellVars;
  }, []);

  return (
    <>
      <HandheldBody />
      <HandheldScreenFrame />
      <HandheldChin />

      {/* In the glass: the well, and the console reading itself in. */}
      <div
        className="fixed z-[42] flex flex-col items-center justify-center gap-3 overflow-hidden md:hidden"
        style={{
          left: "var(--hh-glass-inset, 32px)",
          right: "var(--hh-glass-inset, 32px)",
          top: "calc(var(--hh-top, 73px) + env(safe-area-inset-top) + 5px)",
          bottom: "calc(var(--hh-bottom, 164px) + var(--hh-foot, 0px) + env(safe-area-inset-bottom) + 5px)",
          borderRadius: 15,
          background:
            "radial-gradient(120% 100% at 50% 0%, var(--hh-well-1) 0%, var(--hh-well-2) 60%, var(--hh-well-3) 100%)",
          boxShadow: "inset 0 0 0 2px var(--hh-bezel)",
        }}
        role="status"
        aria-label={label}
      >
        <span
          className="text-[7px] font-bold uppercase tracking-[0.42em]"
          style={{ color: "var(--hh-lcd-soft)" }}
        >
          TOP 100 OS
        </span>

        <p
          className="hh-blink text-[10px] font-bold uppercase tracking-[0.30em]"
          style={{ color: "var(--hh-lcd)" }}
        >
          {label}
        </p>

        <div
          className="mt-1 h-[3px] w-[124px] overflow-hidden rounded-full"
          style={{ background: "rgb(var(--hh-lcd-rgb) / 0.22)" }}
        >
          <div className="hh-led h-full w-full rounded-full" style={{ background: "var(--hh-lcd)" }} />
        </div>
      </div>

      {/* A desk is housed in the desk machine, so the wait happens inside its tube,
          on a console that is already standing. */}
      <div className="hidden md:block">
        <ImacHousing>
          <ImacWait label={label} />
        </ImacHousing>
      </div>
    </>
  );
}