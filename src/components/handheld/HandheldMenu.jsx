import { useEffect, useRef } from "react";

// The cartridge menu, rendered inside the viewer rather than over the app. The
// wheel moves the cursor, the centre button loads the cartridge, B backs out.
export default function HandheldMenu({ groups, cursor, locationKey, onActivate, onJump, onClose }) {
  const cursorRef = useRef(null);

  useEffect(() => {
    cursorRef.current?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  let index = -1;

  return (
    <div
      className="fixed left-0 right-0 z-[45] flex flex-col md:hidden"
      style={{
        top: "calc(var(--hh-top, 90px) + env(safe-area-inset-top) + 5px)",
        bottom: "calc(var(--hh-bottom, 176px) + env(safe-area-inset-bottom) + 5px)",
        left: 7,
        right: 7,
        borderRadius: 15,
        overflow: "hidden",
        background: "linear-gradient(180deg, #0F2417 0%, #0B1A11 60%, #071009 100%)",
        boxShadow: "inset 0 0 0 2px rgba(30,58,90,0.55)",
      }}
      role="dialog"
      aria-label="Cartridge menu"
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ borderBottom: "1px solid rgba(169,196,108,0.28)" }}
      >
        <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.28em] text-[#A9C46C]">
          <span className="hh-blink">▶</span> TOP 100 OS
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[0.28em] text-[#6E8B4A]">
          {groups.reduce((total, group) => total + group.items.length, 0)} cartridges
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-1.5 py-2">
        {groups.map((group) => (
          <div key={group.key} className="mb-2.5">
            <p className="px-2 pb-1 text-[7.5px] font-bold uppercase tracking-[0.3em] text-[#6E8B4A]">
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
                    background: isCursor ? "rgba(169,196,108,0.16)" : "transparent",
                    boxShadow: isCursor ? "inset 0 0 0 1px rgba(169,196,108,0.45)" : "none",
                    borderRadius: 6,
                  }}
                >
                  <span
                    className="w-[9px] shrink-0 text-[9px] leading-none text-[#A9C46C]"
                    style={{ opacity: isCursor ? 1 : 0 }}
                  >
                    ▶
                  </span>

                  {Icon ? (
                    <Icon className="h-[13px] w-[13px] shrink-0" style={{ color: isActive ? "#D6E89A" : "#7FA04F" }} />
                  ) : null}

                  <span
                    className="flex-1 truncate text-[12px] font-semibold leading-none"
                    style={{ color: isCursor || isActive ? "#E6F2B8" : "#A9C46C" }}
                  >
                    {item.label}
                  </span>

                  {isActive ? (
                    <span className="shrink-0 text-[7px] font-bold uppercase tracking-[0.2em] text-[#D6E89A]">
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
        style={{ borderTop: "1px solid rgba(169,196,108,0.24)", background: "rgba(7,16,9,0.75)" }}
      >
        <span className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#6E8B4A]">
          ◀▶ Group · ● Load · B Back
        </span>

        <button
          type="button"
          onClick={onJump}
          aria-label="Next group"
          className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#A9C46C]"
        >
          Group ▸
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close cartridge menu"
          className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#D6E89A]"
        >
          Exit
        </button>
      </div>
    </div>
  );
}