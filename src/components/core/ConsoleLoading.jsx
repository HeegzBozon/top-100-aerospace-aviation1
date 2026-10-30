import { useLayoutEffect } from "react";
import { applyShellVars, releaseShellVars } from "@/components/handheld/handheldGeometry";
import ImacHousing from "@/components/desktop/ImacHousing";
import ImacWait from "@/components/desktop/ImacWait";

// The app's loading state.
//
// A desk is housed in the desk machine, so the wait happens inside its tube. On a
// handset the picture keeps the whole screen — there is no case to paint around it —
// so the console simply reads itself in, full bleed, in the colours it always did.
export default function ConsoleLoading({ label = "Powering up" }) {
  useLayoutEffect(() => {
    applyShellVars();
    return releaseShellVars;
  }, []);

  return (
    <>
      <div
        className="fixed inset-0 z-[42] flex flex-col items-center justify-center gap-3 overflow-hidden md:hidden"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, var(--hh-well-1) 0%, var(--hh-well-2) 60%, var(--hh-well-3) 100%)",
        }}
        role="status"
        aria-label={label}
      >
        <span
          className="text-[9px] font-bold uppercase tracking-[0.42em]"
          style={{ color: "var(--hh-lcd-soft)" }}
        >
          TOP 100 OS
        </span>

        <p
          className="hh-blink text-[12px] font-bold uppercase tracking-[0.30em]"
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