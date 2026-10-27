import { Loader2 } from "lucide-react";

// The wait for a surface that carries a heavy instrument — the globe, the simulator.
//
// ConsoleLoading is the app's opening wait: it paints the whole device because there
// is nothing underneath it yet. A surface arriving later is different — the console
// and the desk are already standing, and what is late is one chunk. So this fallback
// fills only the picture, in place, and leaves the frame alone: the machine the reader
// is holding never blinks away and come back.
export default function SurfaceLoader({ label = "Loading surface" }) {
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center bg-editorial-navy px-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-editorial-gold" aria-hidden="true" />
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.3em] text-editorial-cream/70">
          {label}
        </p>
      </div>
    </div>
  );
}