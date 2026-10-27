import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { hourPhase, isReturningVisitor, markVisit, pickHint, pickLine } from "./appOpening";

// The title card. Every load opens the way a game opens: the studio mark, the
// hour's sky, then the welcome — plain for a first visit, by name for a Fellow
// coming back. It plays on every page load and stands in for the console's own
// power-on; any tap goes straight through to the app.
// Cut to the size it is drawn at: the original was a 1024px, 1.8 MB file shown at
// 32–40px, which made the mark the largest thing on the first screen and the slowest.
const LOGO = "/brand/top100-mark-128.png";
const SEQUENCE_MS = 4400;
const DEPART_MS = 740;

export default function AppSplash() {
  const [phase] = useState(() => hourPhase());
  const [line] = useState(() => pickLine(phase));
  const [hint] = useState(() => pickHint());
  const [who, setWho] = useState(() => ({ back: isReturningVisitor(), first: "" }));
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  const close = useCallback(() => setLeaving(true), []);

  // A welcome, and the first mark this device leaves.
  useEffect(() => {
    markVisit();
    // The static card in index.html has been on screen since the document arrived.
    // This card is now painted over it, so the handover can be made.
    document.getElementById("boot-shell")?.remove();
    let cancelled = false;
    base44.auth
      .me()
      .then((me) => {
        if (cancelled) return;
        const first = (me?.full_name || "").split(" ")[0];
        setWho({ back: true, first });
      })
      .catch(() => {
        // A visitor: the card stays impersonal.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(close, SEQUENCE_MS);
    return () => window.clearTimeout(timer);
  }, [close]);

  useEffect(() => {
    if (!leaving) return undefined;
    const timer = window.setTimeout(() => setGone(true), DEPART_MS);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  if (gone) return null;

  const headline = who.back ? "Welcome back" : "Welcome";
  const stamp = moment().format("ddd D MMM · HH:mm");

  return (
    <div
      className={`as-frame ${leaving ? "as-depart" : ""}`}
      style={{ background: phase.sky }}
      role="status"
      aria-label={`${headline}. ${phase.kicker}.`}
    >
      {/* The hour's weather: a low glow on the horizon, and stars after dark */}
      <div className="as-veil pointer-events-none absolute inset-0" style={{ background: phase.glow }} />
      <div
        className="as-veil pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgb(var(--editorial-cream-rgb) / 0.55) 0.5px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: phase.stars ? 0.45 : 0.14,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 130px rgba(5,11,20,0.72)" }}
      />

      {/* Any tap enters */}
      <button
        type="button"
        onClick={close}
        aria-label="Skip the opening"
        className="absolute inset-0 z-10 cursor-default"
      />

      <div className="pointer-events-none relative z-20 flex h-full flex-col justify-between px-7 py-8 md:px-16 md:py-14">
        <div className="as-mark flex items-center gap-3">
          <img src={LOGO} alt="" className="h-8 w-8 object-contain md:h-10 md:w-10" />
          <span className="text-[9px] font-bold uppercase tracking-[0.34em] text-editorial-gold">
            TOP 100 Aerospace &amp; Aviation
          </span>
          <span className="ml-auto text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-cream/40">
            MMXXVI
          </span>
        </div>

        <div className="max-w-2xl">
          <p
            className="as-rise text-[9px] font-bold uppercase tracking-[0.34em] text-editorial-copper"
            style={{ animationDelay: "0.35s" }}
          >
            {phase.kicker}
          </p>

          <div
            className="as-rule mt-4 h-px w-36 md:w-64"
            style={{ background: "linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)" }}
          />

          <h1
            className="mt-5 font-heading text-[2.6rem] leading-[1.02] text-editorial-cream md:text-8xl"
            style={{ color: "#FAF8F5" }}
          >
            {headline}
            {who.first ? (
              <>
                ,{" "}
                <span className="italic" style={{ color: "#C9A87C" }}>
                  {who.first}
                </span>
              </>
            ) : null}
          </h1>

          {line ? (
            <figure className="as-rise mt-5 max-w-xl" style={{ animationDelay: "1.2s" }}>
              <blockquote className="font-heading text-[15px] italic leading-relaxed text-editorial-cream/85 md:text-xl">
                &ldquo;{line.text}&rdquo;
              </blockquote>
              <figcaption className="mt-3 text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-gold">
                {line.name}
                {line.source ? ` · ${line.source}` : ""}
              </figcaption>
            </figure>
          ) : null}
        </div>

        <div>
          <div className="h-px w-full bg-editorial-cream/15">
            <div
              className="as-hair h-px w-full"
              style={{
                background: "linear-gradient(90deg, #B87333, #C9A87C)",
                animationDuration: `${SEQUENCE_MS}ms`,
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-cream/50">
            <span className="as-rise" style={{ animationDelay: "2.2s" }}>
              {hint}
            </span>
            <span>{stamp}</span>
          </div>
        </div>
      </div>

      {/* The dissolve: the projector hands the frame over to the app's own surface */}
      {leaving ? (
        <div
          className="as-handoff pointer-events-none absolute inset-0 z-30"
          style={{ background: "#FAF8F5" }}
        />
      ) : null}
    </div>
  );
}