// The scroll rail down the right edge of the glass: one tick per module, the
// current one drawn as a copper thumb. Tapping a tick jumps there. This is the
// only place the page reports its own structure.
export default function ModuleRail({ modules, index, onJump }) {
  if (modules.length < 2) return null;

  return (
    <div
      className="pointer-events-none fixed right-[9px] z-30 flex w-[16px] flex-col items-center justify-center gap-[3px] md:hidden"
      style={{
        top: "calc(var(--hh-top, 82px) + env(safe-area-inset-top) + 32px)",
        bottom: "calc(var(--hh-bottom, 176px) + env(safe-area-inset-bottom) + 10px)",
      }}
      aria-hidden="false"
    >
      {modules.map((module, i) => {
        const active = i === index;
        return (
          <button
            key={`${module.label}-${i}`}
            type="button"
            onClick={() => onJump(i)}
            aria-label={`${module.label}${active ? " — current section" : ""}`}
            aria-current={active ? "true" : undefined}
            className="pointer-events-auto flex h-[9px] w-[16px] items-center justify-center"
          >
            <span
              className="rounded-full transition-all duration-200"
              style={
                active
                  ? { width: 5, height: 13, background: "#B87333", boxShadow: "0 0 7px rgba(184,115,51,0.65)" }
                  : { width: 3, height: 4, background: "rgba(30,58,90,0.30)" }
              }
            />
          </button>
        );
      })}
    </div>
  );
}