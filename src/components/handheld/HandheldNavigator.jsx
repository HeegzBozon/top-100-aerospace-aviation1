import { useEffect, useRef } from "react";
import { ChevronRight, Power, Volume2, VolumeX, X } from "lucide-react";

// The navigator: the console's full-screen menu. Every surface in the journey
// map, grouped, with the current one flagged. The D-pad moves the highlight,
// A opens it, B closes.
export default function HandheldNavigator({
  groups,
  highlight,
  locationKey,
  onSelect,
  onClose,
  soundOn,
  onToggleSound,
}) {
  const highlightRef = useRef(null);

  useEffect(() => {
    highlightRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlight]);

  let index = -1;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col md:hidden"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #16304E 0%, #0E2036 55%, #07111F 100%)",
      }}
    >
      {/* Bezel header */}
      <div
        className="flex items-center justify-between px-4 pt-[max(14px,env(safe-area-inset-top))] pb-2.5"
        style={{ borderBottom: "1px solid rgba(201,168,124,0.22)" }}
      >
        <span className="flex items-center gap-1.5">
          <span className="hh-led h-1.5 w-1.5 rounded-full bg-[#2ED573]" />
          <span className="text-[8px] font-bold uppercase tracking-[0.26em] text-[#FAF8F5]/55">
            Navigator
          </span>
        </span>
        <span className="text-[8px] font-bold uppercase tracking-[0.26em] text-[#C9A87C]/70">
          HW-88
        </span>
        <span className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#FAF8F5]/70 transition-colors active:bg-white/10"
          >
            {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigator"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#FAF8F5]/70 transition-colors active:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-[168px] pt-4">
        {groups.map((group) => (
          <section key={group.key} className="mb-6">
            <p className="mb-2 px-1 text-[8px] font-bold uppercase tracking-[0.3em] text-[#C9A87C]">
              {group.label}
            </p>
            <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid rgba(250,248,245,0.09)" }}>
              {group.items.map((item) => {
                index += 1;
                const itemIndex = index;
                const isHighlighted = itemIndex === highlight;
                const isActive = !!item.to && item.to === locationKey;
                const Icon = item.icon || Power;

                return (
                  <button
                    key={`${group.key}-${item.label}`}
                    ref={isHighlighted ? highlightRef : null}
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors"
                    style={{
                      background: isHighlighted ? "rgba(201,168,124,0.16)" : "rgba(250,248,245,0.035)",
                      boxShadow: isHighlighted ? "inset 0 0 0 1px rgba(201,168,124,0.55)" : "none",
                      borderBottom: "1px solid rgba(250,248,245,0.06)",
                    }}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: isActive ? "rgba(201,168,124,0.22)" : "rgba(250,248,245,0.07)",
                        boxShadow: isActive ? "inset 0 0 0 1px rgba(201,168,124,0.45)" : "none",
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: isActive ? "#E3CBA2" : "#C9A87C" }} />
                    </span>

                    <span
                      className="flex-1 text-[13px] font-semibold"
                      style={{ color: isActive ? "#FAF8F5" : "rgba(250,248,245,0.82)" }}
                    >
                      {item.label}
                    </span>

                    {isActive ? (
                      <span className="text-[7px] font-bold uppercase tracking-[0.22em] text-[#C9A87C]">
                        Current
                      </span>
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-[#FAF8F5]/25" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3"
        style={{
          background: "linear-gradient(180deg, rgba(7,17,31,0), rgba(7,17,31,0.96) 55%)",
        }}
      >
        <p className="text-center text-[8px] font-bold uppercase tracking-[0.24em] text-[#FAF8F5]/40">
          D-Pad Move · A Select · B Close · Start Home
        </p>
      </div>
    </div>
  );
}