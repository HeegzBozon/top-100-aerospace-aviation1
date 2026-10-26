// The viewer. A recessed LCD well with its own status line: content renders in
// the well, this layer draws the glass over it (scanlines, vignette, sheen) so
// every surface reads as something you are looking at on a screen.
export default function HandheldScreenFrame({ surface }) {
  return (
    <div
      className="pointer-events-none fixed left-0 right-0 z-30 md:hidden"
      style={{
        top: "calc(var(--hh-top, 90px) + env(safe-area-inset-top))",
        bottom: "calc(var(--hh-bottom, 188px) + env(safe-area-inset-bottom))",
      }}
      aria-hidden="true"
    >
      {/* LCD well — the recessed frame around the picture */}
      <div
        className="absolute inset-x-[7px] inset-y-[5px] overflow-hidden rounded-[15px]"
        style={{
          boxShadow:
            "inset 0 0 0 2px rgba(30,58,90,0.62), inset 0 0 0 3px rgba(250,248,245,0.35), inset 0 4px 16px rgba(7,17,31,0.42)",
        }}
      >
        <div className="hh-glass absolute inset-0" />
      </div>

      {/* Status line — sits inside the well, above the content */}
      <div
        className="absolute left-[9px] right-[9px] top-[7px] flex h-[22px] items-center justify-between rounded-t-[12px] px-2.5"
        style={{
          background: "linear-gradient(180deg, rgba(7,17,31,0.90), rgba(7,17,31,0.62))",
        }}
      >
        <span className="flex items-center gap-1.5 truncate text-[7px] font-bold uppercase tracking-[0.24em] text-[#C9A87C]">
          <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-[#2ED573]" />
          {surface}
        </span>
        <span className="shrink-0 text-[7px] font-bold uppercase tracking-[0.24em] text-[#FAF8F5]/40">
          Wheel&nbsp;·&nbsp;Select
        </span>
      </div>
    </div>
  );
}