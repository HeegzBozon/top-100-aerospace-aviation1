// The mark: the masthead rule in copper running into rose gold, the title set in
// the editorial serif, and the discipline line under it. The same lockup the
// publication opens on, so the title screen and the issue read as one house.
export default function StartMark() {
  return (
    <div className="shrink-0">
      <div
        className="h-px w-16 md:w-56"
        style={{ background: "linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)" }}
      />

      {/* Set to the size the glass can spare: the masthead is a third of the cover on a
          phone, and the keys it stands above are what the reader came for. */}
      <h1 className="mt-2 font-heading text-[1.95rem] leading-[0.95] tracking-[-0.01em] text-editorial-cream md:mt-3 md:text-7xl">
        TOP 100
      </h1>

      <p className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-cream/60 md:mt-2 md:text-[11px] md:tracking-[0.34em]">
        Aerospace &amp; Aviation
      </p>
    </div>
  );
}