import { useEffect, useRef, useState } from "react";
import { ScanLine } from "lucide-react";
import { blip, buzz } from "./handheldSound";

// What a code can point at: a path on this machine, or one of its own addresses. A code
// carrying anything else is read back to the reader rather than followed — the scanner
// opens the platform, never the web.
function targetFrom(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (text.startsWith("/") && !text.startsWith("//")) return text;
  try {
    const url = new URL(text);
    if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
  return null;
}

const READER = typeof window !== "undefined" && "BarcodeDetector" in window;

// The eye on the keypad: the same key that searches reads a code too. The camera is the
// machine's back lens, the frame is drawn as a well of glass like every other instrument
// on the case, and the moment a code is read the machine goes where it points.
export default function HandheldScanner({ onOpen, onClose }) {
  const videoRef = useRef(null);
  // starting → scanning → read (a code that is not this machine's) | unsupported | refused
  const [state, setState] = useState(READER ? "starting" : "unsupported");
  const [raw, setRaw] = useState("");
  const openRef = useRef(onOpen);
  openRef.current = onOpen;

  useEffect(() => {
    if (!READER) return undefined;

    let stream = null;
    let timer = 0;
    let cancelled = false;

    const stop = () => {
      clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("unsupported");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      } catch {
        if (!cancelled) setState("refused");
        return;
      }
      if (cancelled) {
        stop();
        return;
      }

      const video = videoRef.current;
      if (!video) {
        stop();
        return;
      }
      video.srcObject = stream;
      try {
        await video.play();
      } catch {
        // Some browsers decline the promise and play anyway; the loop below finds out.
      }
      if (cancelled) return;
      setState("scanning");

      let detector;
      try {
        detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      } catch {
        detector = new window.BarcodeDetector();
      }

      timer = setInterval(async () => {
        if (!video.videoWidth) return;
        let codes = [];
        try {
          codes = await detector.detect(video);
        } catch {
          return;
        }
        const value = codes?.[0]?.rawValue;
        if (!value) return;
        clearInterval(timer);
        const to = targetFrom(value);
        if (to) {
          blip("select");
          buzz();
          openRef.current?.(to);
          return;
        }
        setRaw(value);
        setState("read");
      }, 200);
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  const note = {
    starting: "Opening the lens…",
    scanning: "Hold a code in the frame.",
    read: "This code is not one of ours.",
    unsupported: "This handset has no code reader.",
    refused: "The camera is closed to the machine.",
  }[state];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.16)" }}
      >
        <span
          className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "var(--hh-lcd)" }}
        >
          <ScanLine className="h-[11px] w-[11px]" strokeWidth={2.4} /> Scan
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--hh-lcd-bright)" }}
        >
          Search instead
        </button>
      </div>

      <div className="min-h-0 flex-1 p-3">
        <div
          className="relative h-full overflow-hidden rounded-[10px]"
          style={{
            background: "var(--hh-recess)",
            boxShadow: "inset 0 0 0 1px rgb(var(--hh-ink-rgb) / 0.14), inset 0 6px 14px -8px rgba(3,6,13,0.9)",
          }}
        >
          <video
            ref={videoRef}
            muted
            playsInline
            className="h-full w-full object-cover"
            style={{ display: state === "scanning" || state === "starting" ? "block" : "none" }}
          />

          {/* The frame the code is held in. */}
          {state === "scanning" ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-6 rounded-[6px]"
              style={{ boxShadow: "0 0 0 1px rgb(var(--hh-lcd) / 0.55), 0 0 26px rgba(169,188,204,0.18)" }}
            />
          ) : null}

          {state !== "scanning" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
              <ScanLine className="mb-2 h-5 w-5" style={{ color: "var(--hh-lcd-soft)" }} />
              <p className="text-[11px] font-semibold" style={{ color: "var(--hh-lcd)" }}>
                {note}
              </p>
              {state === "read" ? (
                <p className="mt-1 line-clamp-3 text-[9px] leading-relaxed" style={{ color: "var(--hh-lcd-soft)" }}>
                  {raw}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <p
        className="px-3 pb-2 text-[7px] font-bold uppercase tracking-[0.22em]"
        style={{ color: "var(--hh-lcd-soft)" }}
      >
        {state === "scanning" ? "The machine opens what it reads" : "A code on the platform"}
      </p>
    </div>
  );
}