import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { B } from "@/components/fellow-home/fellowHomeConfig";
import { registerPicker, touchPicker } from "@/components/handheld/handheldPicker";
import { getStage } from "@/components/handheld/useModuleNavigation";

// The Fellow's own profile, as the console reads it: a menu of the profile's
// panels, and one panel open on the glass.
//
// The ring walks the menu and the row under the cursor is the one A opens. Once
// a panel is open the ring reads it down the glass, back and forward turn to the
// neighbouring panel, and B returns to the menu. Nothing about the panels
// themselves changes: the desk shows the very same components stacked down a
// page, and this is the glass's way of holding them one at a time.
export default function ProfileConsole({ panels }) {
  const [cursor, setCursor] = useState(0);
  const [open, setOpen] = useState(false);
  const panelsRef = useRef(panels);
  panelsRef.current = panels;
  const cursorRef = useRef(0);
  const openRef = useRef(false);
  const rowsRef = useRef([]);

  const land = useCallback((target, wrap) => {
    const list = panelsRef.current;
    if (!list.length) return null;
    const next = wrap ? ((target % list.length) + list.length) % list.length : target;
    if (next < 0 || next >= list.length) return null;
    cursorRef.current = next;
    setCursor(next);
    return list[next].label;
  }, []);

  const enterAt = useCallback((i) => {
    cursorRef.current = i;
    openRef.current = true;
    setCursor(i);
    setOpen(true);
  }, []);

  const leave = useCallback(() => {
    openRef.current = false;
    setOpen(false);
  }, []);

  // The console's handle on the profile: rotation walks the menu, or reads the
  // panel that is open; back and forward move to the neighbour.
  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => panelsRef.current.map((panel) => panel.label),
      index: () => cursorRef.current,
      step: (direction) => (openRef.current ? null : land(cursorRef.current + direction, true)),
      page: (direction) => land(cursorRef.current + direction, false),
      goTo: (i) => land(i, false),
      enter: () => {
        if (openRef.current) return false;
        enterAt(cursorRef.current);
        return true;
      },
      back: () => {
        if (!openRef.current) return false;
        leave();
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);

  // A deep link into one of the profile's boards — the console's own menu sends
  // those — opens the panel that holds it, rather than landing on the menu and
  // making the Fellow find the board again.
  const location = useLocation();
  const boardParam = new URLSearchParams(location.search).get("board");

  useEffect(() => {
    if (!boardParam) return;
    const i = panelsRef.current.findIndex((panel) => panel.key === "board");
    if (i >= 0) enterAt(i);
  }, [boardParam, enterAt]);

  useEffect(() => {
    touchPicker();
  }, [cursor, open, panels.length]);

  // A panel always opens at its own beginning, and the menu always comes back
  // with the row you chose on the screen.
  useEffect(() => {
    getStage()?.scrollTo({ top: 0 });
  }, [cursor, open]);

  useEffect(() => {
    if (open) return;
    rowsRef.current[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor, open]);

  if (!panels.length) return null;

  if (!open) {
    return (
      <div className="px-3 pb-5 pt-4">
        <div
          className="flex items-baseline justify-between gap-3 pb-2"
          style={{ borderBottom: `1px solid ${B.border}` }}
        >
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            Your profile
          </p>
          <p className="text-[7.5px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>
            ◀▶ Scroll · A Open
          </p>
        </div>

        <div className="mt-2.5 space-y-2.5">
          {panels.map((panel, i) => {
            const Icon = panel.icon;
            const active = i === cursor;
            return (
              <button
                key={panel.key}
                type="button"
                ref={(node) => {
                  rowsRef.current[i] = node;
                }}
                onClick={() => enterAt(i)}
                aria-current={active ? "true" : undefined}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-[transform,box-shadow,border-color] duration-200 active:scale-[0.99]"
                style={{
                  background: active ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.62)",
                  border: `1px solid ${active ? "rgb(201 168 124 / 0.85)" : B.border}`,
                  boxShadow: active
                    ? "0 10px 24px rgba(7,17,31,0.26), inset 0 0 0 1px rgb(201 168 124 / 0.34)"
                    : "0 1px 2px rgba(7,17,31,0.05)",
                  transform: active ? "translateY(-1px)" : undefined,
                }}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(30,58,90,0.06)", border: `1px solid ${B.border}` }}
                >
                  <Icon className="h-[16px] w-[16px]" style={{ color: active ? B.copper : B.navy }} />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className="block font-heading text-[14px] font-semibold leading-tight"
                    style={{ color: B.navy }}
                  >
                    {panel.label}
                  </span>
                  {panel.hint ? (
                    <span className="mt-0.5 block text-[10.5px] leading-snug" style={{ color: B.muted }}>
                      {panel.hint}
                    </span>
                  ) : null}
                </span>

                <span
                  className="shrink-0 font-heading text-[11px]"
                  style={{ color: active ? B.copper : "rgba(30,58,90,0.32)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const panel = panels[cursor];

  return (
    <div className="pb-5">
      <div
        className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2"
        style={{
          background: "rgba(250,248,245,0.95)",
          borderBottom: `1px solid ${B.border}`,
          backdropFilter: "blur(6px)",
        }}
      >
        <button
          type="button"
          onClick={leave}
          aria-label="Back to the profile menu"
          className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold uppercase tracking-[0.16em] transition-opacity active:opacity-60"
          style={{ color: B.copper }}
        >
          <ChevronLeft className="h-[11px] w-[11px]" /> Menu
        </button>

        <span className="min-w-0 flex-1 truncate text-right font-heading text-[12px]" style={{ color: B.navy }}>
          {panel.label}
        </span>

        <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
          {cursor + 1} / {panels.length}
        </span>
      </div>

      <div>{panel.node}</div>
    </div>
  );
}