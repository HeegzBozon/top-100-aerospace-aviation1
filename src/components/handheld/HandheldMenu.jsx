import { useEffect, useRef } from "react";

// The cartridge menu, rendered inside the viewer rather than over the app. The
// wheel moves the cursor, the centre button loads the cartridge, B backs out.
// The pane is the finish's phosphor, so the screen changes with the hardware.
export default function HandheldMenu({
  groups,
  cursor,
  locationKey,
  unit = "cartridges",
  hint = "◀▶ Group · ● Load · B Back",
  onActivate,
  onJump,
  onClose,
}) {
  const cursorRef = useRef(null);

  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  let index = -1;

  return (
    <div
      className="fixed z-[45] flex flex-col md:hidden"
      style={{
        top: "calc(var(--hh-top, 96px) + env(safe-area-inset-top) + 5px)",
        bottom: "calc(var(--hh-bottom, 176px) + env(safe-area-inset-bottom) + 5px)",
        left: "var(--hh-glass-inset, 7px)",
        right: "var(--hh-glass-inset, 7px)",
        borderRadius: 15,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, var(--hh-well-1) 0%, var(--hh-well-2) 60%, var(--hh-well-3) 100%)",
        boxShadow: "inset 0 0 0 2px var(--hh-bezel)",
      }}
      role="dialog"
      aria-label="Cartridge menu"
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid rgb(var(--hh-metal-rgb) / 0.28)" }}
      >
        <span
          className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "var(--hh-lcd)" }}
        >
          <span className="hh-blink">▶</span> TOP 100 OS
        </span>
        <span
          className="text-[8px] font-bold uppercase tracking-[0.28em]"
          style={{ color: "var(--hh-lcd-soft)" }}
        >
          {groups.reduce((total, group) => total + group.items.length, 0)} {unit}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-1.5 py-2">
        {groups.map((group) => (
          <div key={group.key} className="mb-2.5">
            <p
              className="px-2 pb-1 text-[7.5px] font-bold uppercase tracking-[0.3em]"
              style={{ color: "var(--hh-lcd-soft)" }}
            >
              {group.label}
            </p>

            {group.items.map((item) => {
              index += 1;
              const itemIndex = index;
              const isCursor = itemIndex === cursor;
              const isActive = !!item.to && item.to === locationKey;
              const Icon = item.icon;

              return (
                <button
                  key={`${group.key}-${item.label}`}
                  ref={isCursor ? cursorRef : null}
                  type="button"
                  onClick={() => onActivate(item)}
                  className="flex w-full items-center gap-2 px-2 py-[7px] text-left"
                  style={{
                    background: isCursor ? "rgb(var(--hh-lcd-rgb, 169 196 108) / 0.16)" : "transparent",
                    boxShadow: isCursor ? "inset 0 0 0 1px rgb(var(--hh-lcd-rgb, 169 196 108) / 0.45)" : "none",
                    borderRadius: 6,
                  }}
                >
                  <span
                    className="w-[9px] shrink-0 text-[9px] leading-none"
                    style={{ color: "var(--hh-lcd)", opacity: isCursor ? 1 : 0 }}
                  >
                    ▶
                  </span>

                  {/* A finish shows the shell it will put on the device */}
                  {item.swatch ? (
                    <span className="flex shrink-0 items-center gap-[3px]">
                      {item.swatch.map((tone) => (
                        <span
                          key={tone}
                          className="h-[9px] w-[9px] rounded-full"
                          style={{ background: tone, boxShadow: "inset 0 0 0 1px rgba(7,17,31,0.35)" }}
                        />
                      ))}
                    </span>
                  ) : Icon ? (
                    <Icon
                      className="h-[13px] w-[13px] shrink-0"
                      style={{ color: isActive ? "var(--hh-lcd-bright)" : "var(--hh-lcd-soft)" }}
                    />
                  ) : null}

                  <span
                    className="flex-1 truncate text-[12px] font-semibold leading-none"
                    style={{ color: isCursor || isActive ? "var(--hh-lcd-bright)" : "var(--hh-lcd)" }}
                  >
                    {item.label}
                  </span>

                  {isActive ? (
                    <span
                      className="shrink-0 text-[7px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: "var(--hh-lcd-bright)" }}
                    >
                      Now
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer — group hopping and the way out */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderTop: "1px solid rgb(var(--hh-metal-rgb) / 0.24)", background: "rgba(7,16,9,0.35)" }}
      >
        <span
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--hh-lcd-soft)" }}
        >
          {hint}
        </span>

        {onJump ? (
          <button
            type="button"
            onClick={onJump}
            aria-label="Next group"
            className="text-[7px] font-bold uppercase tracking-[0.22em]"
            style={{ color: "var(--hh-lcd)" }}
          >
            Group ▸
          </button>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close cartridge menu"
          className="text-[7px] font-bold uppercase tracking-[0.22em]"
          style={{ color: "var(--hh-lcd-bright)" }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}