// The viewer. A recessed LCD well drawn exactly around the picture window: the
// bezel ring sits in the margin outside the content, a status line caps the top,
// and the glass (scanlines, vignette, sheen) lies over the content alone.
export default function HandheldScreenFrame({ surface }) {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-30 md:hidden"
      style={{
        top: "calc(54px + env(safe-area-inset-top))",
        bottom: "calc(var(--hh-bottom, 188px) + env(safe-area-inset-bottom))",
      }}
      aria-hidden="true"
    >
      {/* Bezel ring — outside the picture, so nothing crosses it */}
      <div
        className="absolute inset-0 rounded-[16px]"
        style={{
          boxShadow:
            "inset 0 0 0 2px rgba(30,58,90,0.62), inset 0 0 0 3px rgba(250,248,245,0.35), inset 0 5px 18px rgba(7,17,31,0.32)",
        }}
      />

      {/* Status line — caps the well, above the picture */}
      <div
        className="absolute left-[7px] right-[7px] top-[5px] flex h-[22px] items-center justify-between rounded-t-[12px] px-2.5"
        style={{
          background: "linear-gradient(180deg, rgba(7,17,31,0.90), rgba(7,17,31,0.62))",
        }}
      >
        <span className="flex items-center gap-1.5 truncate text-[7px] font-bold uppercase tracking-[0.24em] text-[#C9A87C]">
          <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-[#2ED573]" />
          {surface}
        </span>
        <span className="shrink-0 text-[7px] font-bold uppercase tracking-[0.24em] text-[#FAF8F5]/40">
          Wheel&nbsp;·&nbsp;A
        </span>
      </div>

      {/* Glass — over the picture only */}
      <div className="hh-glass absolute bottom-[5px] left-[7px] right-[7px] top-[27px] overflow-hidden rounded-b-[12px]" />
    </div>
  );
}