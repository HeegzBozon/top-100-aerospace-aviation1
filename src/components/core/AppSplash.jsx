import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { base44 } from "@/api/base44Client";
import { hourPhase, isReturningVisitor, markVisit, openingPlaysNow } from "./appOpening";

// The title card. The app opens the way the console powers on: the hour's sky
// behind the brand, then a welcome — plain for a first visit, by name for a
// Fellow coming back. It plays once per session, in the glass on a phone and
// full-frame on a desk, and any tap goes straight through to the app.
const LOGO =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68996845be6727838fdb822e/72caf8e2f_TOP100AerospaceAviationlogo.png";
const SEQUENCE_MS = 3600;
const FADE_MS = 600;

export default function AppSplash() {
  // Asked during the first render of the load, before anything else: whichever
  // of the title card and the console's power-on asks first gets to play.
  const [plays] = useState(() => openingPlaysNow());
  const [phase] = useState(() => hourPhase());
  const [who, setWho] = useState(() => ({ back: isReturningVisitor(), first: "" }));
  const [closing, setClosing] = useState(false);
  const [gone, setGone] = useState(false);

  const close = useCallback(() => setClosing(true), []);

  // A welcome, and the first mark of this device.
  useEffect(() => {
    if (!plays) return undefined;
    markVisit();
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
  }, [plays]);

  useEffect(() => {
    if (!plays) return undefined;
    const timer = window.setTimeout(close, SEQUENCE_MS);
    return () => window.clearTimeout(timer);
  }, [plays, close]);

  useEffect(() => {
    if (!closing) return undefined;
    const timer = window.setTimeout(() => setGone(true), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  if (!plays || gone) return null;

  const headline = who.back ? "Welcome back" : "Welcome";
  const stamp = moment().format("ddd D MMM · HH:mm");

  return (
    <div
      className={`as-frame ${closing ? "as-out" : ""}`}
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
        <div className="flex items-center gap-3">
          <img src={LOGO} alt="" className="as-rise h-8 w-8 object-contain" />
          <span
            className="as-rise text-[9px] font-bold uppercase tracking-[0.34em] text-editorial-gold"
            style={{ animationDelay: "0.1s" }}
          >
            TOP 100 Aerospace &amp; Aviation
          </span>
        </div>

        <div className="max-w-2xl">
          <p
            className="as-rise text-[9px] font-bold uppercase tracking-[0.34em] text-editorial-copper"
            style={{ animationDelay: "0.4s" }}
          >
            {phase.kicker}
          </p>

          <div
            className="as-rule mt-4 h-px w-36 md:w-64"
            style={{ background: "linear-gradient(90deg, #B87333, #C9A87C 58%, transparent)" }}
          />

          <h1
            className="as-rise mt-6 font-heading text-4xl leading-[1.06] text-editorial-cream md:text-6xl"
            style={{ animationDelay: "0.6s" }}
          >
            {headline}
            {who.first ? (
              <>
                , <span className="italic text-editorial-gold">{who.first}</span>
              </>
            ) : null}
          </h1>

          <figure className="as-rise mt-5 max-w-xl" style={{ animationDelay: "0.95s" }}>
            <blockquote className="font-heading text-[15px] italic leading-relaxed text-editorial-cream/85 md:text-xl">
              &ldquo;{phase.quote.text}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-[8px] font-bold uppercase tracking-[0.3em] text-editorial-gold">
              {phase.quote.name}
              {phase.quote.source ? ` · ${phase.quote.source}` : ""}
            </figcaption>
          </figure>
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
            <span>Tap to enter</span>
            <span>{stamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}