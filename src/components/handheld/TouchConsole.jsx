import { useEffect, useRef } from "react";
import { Gamepad2, X } from "lucide-react";

// The console, carried over the picture instead of built around it.
//
// A handset has no room for a moulding, so the picture is the whole screen and the
// machine stands on it: a handle at the foot of the glass that opens one semi-
// transparent panel holding every control the hardware used to print — Home, the
// cartridges, File and Edit, transmissions, search, share and the finish — beside the
// wheel and the keypad, so the console is still held rather than read.
//
// Nothing in the panel is smaller than a fingertip: every key is at least 44 by 44,
// every label is real type rather than engraved micro-print, and the whole thing closes
// on its own scrim, on Escape, or on its own X.
//
// One thing stands outside the panel. When a surface is holding the four face keys —
// the chamber's candidates, where Y, X, B and A are four votes — those keys are put
// under the thumb at all times, because a vote must never be a drawer away.
const FACE_PAD = [
  { name: "Y", pick: "onEdit", label: "Y — first candidate" },
  { name: "X", pick: "onFile", label: "X — second candidate" },
  { name: "B", pick: "onBack", label: "B — third candidate" },
  { name: "A", pick: "onConfirm", label: "A — fourth candidate" },
];

const actionKey =
  "flex min-h-[60px] flex-col items-center justify-center gap-1.5 rounded-2xl px-1 py-2 text-[9.5px] font-bold uppercase tracking-[0.12em] transition-transform active:translate-y-px";

export default function TouchConsole({
  open = false,
  onToggle,
  surface,
  module,
  actions = [],
  sections = [],
  activeSection = 0,
  onJump,
  faceKeys = null,
  speaker = null,
  wheel = null,
  keypad = null,
  hidden = false,
}) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onToggle?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onToggle]);

  return (
    <>
      {/* The four keys a surface has taken. Drawn only while it holds them, above the
          handle, as the keypad they are. */}
      {faceKeys && !open && (
        <div
          className="fixed z-[44] grid grid-cols-2 gap-2"
          style={{ right: 14, bottom: "calc(76px + env(safe-area-inset-bottom))" }}
          role="group"
          aria-label="Console keys"
        >
          {FACE_PAD.map((key) => (
            <button
              key={key.name}
              type="button"
              onClick={faceKeys[key.pick]}
              aria-label={key.label}
              className="hh-pad-key flex h-12 w-12 items-center justify-center rounded-[12px] text-[13px] font-bold"
              style={{ color: "var(--hh-pad-ink)" }}
            >
              {key.name}
            </button>
          ))}
        </div>
      )}

      {/* The handle. One target, at the foot of the screen, out of the way of the page
          and reachable with the same thumb that scrolls it. */}
      {!hidden && !open && (
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={false}
          aria-controls="touch-console"
          aria-label="Open console controls"
          className="fixed z-[44] flex h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-95"
          style={{
            right: 14,
            bottom: "calc(14px + env(safe-area-inset-bottom))",
            background: "rgba(11,21,34,0.88)",
            color: "#EFE9DC",
            boxShadow:
              "inset 0 0 0 1px rgba(201,168,124,0.55), 0 10px 26px rgba(4,9,18,0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Gamepad2 className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {open && (
        <div
          id="touch-console"
          className="fixed inset-0 z-[48]"
          role="dialog"
          aria-modal="true"
          aria-label="Console controls"
        >
          <button
            type="button"
            onClick={onToggle}
            aria-label="Close console controls"
            className="absolute inset-0 h-full w-full"
            style={{ background: "rgba(7,12,22,0.62)", backdropFilter: "blur(3px)" }}
          />

          <div
            className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto rounded-t-[22px] px-3 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3"
            style={{
              background:
                "linear-gradient(180deg, rgba(14,25,41,0.98) 0%, rgba(8,15,26,0.99) 100%)",
              boxShadow:
                "inset 0 1px 0 rgba(201,168,124,0.50), 0 -22px 48px rgba(3,6,13,0.60)",
            }}
          >
            <div className="flex items-center gap-2 px-1">
              <div className="min-w-0 flex-1">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.30em]"
                  style={{ color: "#C9A87C" }}
                >
                  TOP 100 OS
                </p>
                <p
                  className="mt-1 truncate font-heading text-[17px] leading-tight"
                  style={{ color: "#EFE9DC" }}
                >
                  {surface}
                  {module ? ` · ${module}` : ""}
                </p>
              </div>
              {speaker}
              <button
                ref={closeRef}
                type="button"
                onClick={onToggle}
                aria-label="Close console controls"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{
                  color: "#EFE9DC",
                  boxShadow: "inset 0 0 0 1px rgba(201,168,124,0.35)",
                }}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {actions.map(({ key, label, Icon, onSelect }) => (
                <button
                  key={key}
                  type="button"
                  onClick={onSelect}
                  className={actionKey}
                  style={{
                    background: "rgba(239,233,220,0.055)",
                    boxShadow: "inset 0 0 0 1px rgba(239,233,220,0.12)",
                    color: "#EFE9DC",
                  }}
                >
                  <Icon className="h-[18px] w-[18px]" style={{ color: "#C9A87C" }} aria-hidden="true" />
                  <span className="w-full truncate text-center">{label}</span>
                </button>
              ))}
            </div>

            {sections.length > 1 && (
              <div className="mt-3">
                <p
                  className="mb-1.5 px-1 text-[9.5px] font-bold uppercase tracking-[0.28em]"
                  style={{ color: "rgba(239,233,220,0.45)" }}
                >
                  On this surface
                </p>
                <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
                  {sections.map((section, i) => {
                    const active = i === activeSection;
                    return (
                      <button
                        key={`${section.label}-${i}`}
                        type="button"
                        onClick={() => onJump?.(i)}
                        aria-current={active ? "true" : undefined}
                        className="min-h-11 shrink-0 whitespace-nowrap rounded-full px-4 text-[12px] font-semibold"
                        style={
                          active
                            ? {
                                background: "rgba(201,168,124,0.22)",
                                boxShadow: "inset 0 0 0 1px rgba(201,168,124,0.70)",
                                color: "#FAF8F5",
                              }
                            : {
                                background: "rgba(239,233,220,0.05)",
                                boxShadow: "inset 0 0 0 1px rgba(239,233,220,0.10)",
                                color: "rgba(239,233,220,0.72)",
                              }
                        }
                      >
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(wheel || keypad) && (
              <div
                className="mt-4 flex items-center justify-center gap-5 rounded-2xl px-2 py-3"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(239,233,220,0.05), rgba(239,233,220,0.02))",
                  boxShadow: "inset 0 0 0 1px rgba(239,233,220,0.09)",
                }}
              >
                {wheel}
                {keypad}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}