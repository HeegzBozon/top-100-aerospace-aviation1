import { Loader2, RefreshCw } from "lucide-react";
import { AERO } from "./aeroConfig";

// The field before it opens, and the field when it will not. One plate, two
// jobs: a boot bar while the save is read, and a plain sentence with the way back
// in if it cannot be. A blank glass would be the wrong answer either way.
export default function AeroOpening({ label = "Waking the field", note, onRetry }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5" style={{ background: AERO.night }}>
      <div className="w-full max-w-sm text-center">
        <p className="text-[7.5px] font-bold uppercase tracking-[0.3em]" style={{ color: AERO.amber }}>
          Aero-Frontier
        </p>
        <p className="mt-2 font-heading text-[19px] leading-tight text-editorial-cream">{label}</p>

        {onRetry ? (
          <>
            <p className="mx-auto mt-2 max-w-xs text-[11.5px] leading-relaxed" style={{ color: AERO.muted }}>
              {note || "The save could not be read just now. Nothing has been lost."}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-transform active:scale-[0.98]"
              style={{ background: AERO.amber, color: AERO.night }}
            >
              <RefreshCw className="h-[12px] w-[12px]" /> Try again
            </button>
          </>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <Loader2 className="h-[13px] w-[13px] animate-spin" style={{ color: AERO.amber }} />
            <div className="h-[5px] flex-1 overflow-hidden rounded-full" style={{ background: "rgba(242,232,213,0.14)" }}>
              <div className="hh-boot-bar h-full w-full rounded-full" style={{ background: AERO.amber }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}