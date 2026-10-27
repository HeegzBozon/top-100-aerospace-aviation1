import { useMemo } from "react";

// The cover itself: the edition's kicker, the masthead struck in metal, the house
// line, and — on the right — the watch's line, drawn from the hour's own pool. The
// line turns over with the day rather than with every visit, so the cover stands
// still while a reader is looking at it and is a different cover tomorrow.
export default function DesktopStartHero({ phase }) {
  const line = useMemo(() => {
    const lines = phase?.lines || [];
    if (!lines.length) return null;
    return lines[Math.floor(Date.now() / 86400000) % lines.length];
  }, [phase]);

  return (
    <div className="grid items-end gap-10 pt-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-16 lg:pt-14">
      <div className="ds-rise" style={{ animationDelay: "90ms" }}>
        <p className="flex items-center gap-4 text-[9.5px] font-bold uppercase tracking-[0.42em] text-editorial-gold">
          The 2026 Edition
          <span
            className="h-px w-14"
            style={{ background: "linear-gradient(90deg, rgb(var(--editorial-gold-rgb) / 0.7), transparent)" }}
          />
        </p>

        <h1 className="ds-metal mt-5 font-heading text-[clamp(3.6rem,5.9vw,6.6rem)] leading-[0.84] tracking-[-0.02em]">
          TOP 100
        </h1>

        <p className="mt-3 text-[clamp(0.72rem,0.95vw,0.95rem)] font-bold uppercase tracking-[0.44em] text-editorial-cream/70">
          Aerospace &amp; Aviation
        </p>

        <div className="mt-6 flex items-center gap-4">
          <span
            className="h-px w-20 shrink-0"
            style={{ background: "linear-gradient(90deg, #B87333, #C9A87C)" }}
          />
          <p className="font-heading text-[14.5px] italic tracking-[0.015em] text-editorial-cream/60">
            Measured, not ranked.
          </p>
        </div>
      </div>

      {line ? (
        <blockquote
          className="ds-rise border-l pl-6"
          style={{
            borderColor: "rgb(var(--editorial-gold-rgb) / 0.32)",
            animationDelay: "200ms",
          }}
        >
          <p className="font-heading text-[clamp(1rem,1.35vw,1.35rem)] leading-[1.45] text-editorial-cream/90">
            &ldquo;{line.text}&rdquo;
          </p>
          <footer className="mt-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-editorial-gold/90">
              {line.name}
            </p>
            <p className="mt-1 text-[10.5px] leading-snug tracking-[0.04em] text-editorial-cream/45">
              {line.source}
            </p>
          </footer>
        </blockquote>
      ) : null}
    </div>
  );
}