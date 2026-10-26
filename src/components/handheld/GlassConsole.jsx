import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { registerPicker, touchPicker } from "@/components/handheld/handheldPicker";
import { B } from "@/components/fellow-home/fellowHomeConfig";

const getStage = () => document.querySelector("[data-handheld-screen]");

// The console, on the glass. A surface hands over its own panels and the console
// holds them: a menu of them, then one open at a time, driven by the click wheel.
// Rotation walks the menu — the panels are drawn to the ring as a picker, so the
// rail, the cursor and the keys always agree — and stops at the ends of it: the
// menu is an index of panels, not a loop (docs/handheld-cursor-rules.md). A turn
// past the last panel is a turn the glass takes, so the page reads on. Rotation
// reads the open panel too; A opens what the cursor is standing on; B puts the
// panel away and comes back to the menu.
//
// Controlled on purpose: the panel on the glass is `openKey` (null = the menu),
// and every intention the Fellow has is reported back through `onOpen`, so the
// surface beneath keeps owning the state the rest of its page reads.
export default function GlassConsole({ kicker, panels, openKey = null, onOpen, deepLinkParam }) {
  const [cursor, setCursor] = useState(0);
  const rowsRef = useRef([]);

  const cursorRef = useRef(0);
  cursorRef.current = cursor;
  const openRef = useRef(openKey);
  openRef.current = openKey;
  const panelsRef = useRef(panels);
  panelsRef.current = panels;
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  // The cursor is held as a position the ring can walk. The menu stops at its own
  // ends: a turn past the first or last panel is declined, and the console hands
  // it to the glass, which is where reading on from the end of a list belongs.
  const land = useCallback((target) => {
    const list = panelsRef.current;
    if (!list.length) return null;
    if (target < 0 || target >= list.length) return null;
    setCursor(target);
    return list[target].label;
  }, []);

  // The cursor follows a panel opened from somewhere else — a rail tick, a deep
  // link — so the rail and the header name the panel actually on the glass.
  useEffect(() => {
    if (!openKey) return;
    const i = panels.findIndex((panel) => panel.key === openKey);
    if (i >= 0) setCursor(i);
  }, [openKey, panels]);

  // A URL that names a panel opens it, so the console's own menu and the pages
  // around it can send a Fellow straight to a surface.
  const location = useLocation();
  const requested = deepLinkParam
    ? new URLSearchParams(location.search).get(deepLinkParam)
    : null;

  useEffect(() => {
    if (!requested) return;
    if (panelsRef.current.some((panel) => panel.key === requested)) {
      onOpenRef.current?.(requested);
    }
  }, [requested]);

  const api = useRef(null);
  if (!api.current) {
    api.current = {
      labels: () => panelsRef.current.map((panel) => panel.label),
      index: () => cursorRef.current,
      // Rotation walks the menu, and reads an open panel: a turn the console
      // hands back is a turn the glass takes, so the panel scrolls.
      step: (direction) => (openRef.current ? null : land(cursorRef.current + direction)),
      page: (direction) => land(cursorRef.current + direction),
      goTo: (i) => {
        const label = land(i);
        // A tick while a panel is open turns the panel, rather than moving the
        // cursor out from under the one on the glass.
        if (label && openRef.current) onOpenRef.current?.(panelsRef.current[i].key);
        return label;
      },
      enter: () => {
        // A panel is open, so A belongs to the panel and to nothing the console
        // would do. The press is consumed rather than opening the cartridges
        // across the Fellow's work.
        if (openRef.current) return true;
        const panel = panelsRef.current[cursorRef.current];
        if (!panel) return false;
        onOpenRef.current?.(panel.key);
        return true;
      },
      back: () => {
        if (!openRef.current) return false;
        onOpenRef.current?.(null);
        return true;
      },
    };
  }

  useEffect(() => registerPicker(api.current), []);

  useEffect(() => {
    touchPicker();
  }, [cursor, openKey, panels.length]);

  // A panel always opens at its own beginning, and the menu comes back with the
  // row you chose on the screen.
  useEffect(() => {
    getStage()?.scrollTo({ top: 0 });
  }, [cursor, openKey]);

  useEffect(() => {
    if (openKey) return;
    rowsRef.current[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor, openKey]);

  if (!panels.length) return null;

  const openIndex = panels.findIndex((panel) => panel.key === openKey);
  const openPanel = openIndex >= 0 ? panels[openIndex] : null;

  if (!openPanel) {
    return (
      <div className="px-3 pb-5 pt-4">
        <div
          className="flex items-baseline justify-between gap-3 pb-2"
          style={{ borderBottom: `1px solid ${B.border}` }}
        >
          <p className="text-[8.5px] font-bold uppercase tracking-[0.3em]" style={{ color: B.copper }}>
            {kicker}
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
                onClick={() => onOpen?.(panel.key)}
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
                  {Icon ? (
                    <Icon className="h-[16px] w-[16px]" style={{ color: active ? B.copper : B.navy }} />
                  ) : null}
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
          onClick={() => onOpen?.(null)}
          aria-label={`Back to the ${kicker} menu`}
          className="flex shrink-0 items-center gap-0.5 text-[9px] font-bold uppercase tracking-[0.16em] transition-opacity active:opacity-60"
          style={{ color: B.copper }}
        >
          <ChevronLeft className="h-[11px] w-[11px]" /> Menu
        </button>

        <span className="min-w-0 flex-1 truncate text-right font-heading text-[12px]" style={{ color: B.navy }}>
          {openPanel.label}
        </span>

        <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.2em]" style={{ color: B.muted }}>
          {openIndex + 1} / {panels.length}
        </span>
      </div>

      <div>{openPanel.node}</div>
    </div>
  );
}