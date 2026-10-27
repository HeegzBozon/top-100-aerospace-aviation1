// The desk's sky. The hour's light breathing behind the whole plate, two star fields
// drifting at different speeds, the orbit the platform is drawn against, and one long
// sheen crossing everything. All of it is decoration: it never carries a value, never
// takes a pointer, and never re-renders to move.
export default function DesktopStartSky({ phase }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="ds-breathe absolute -inset-[25%]" style={{ background: phase.glow }} />

      <div
        className="ds-drift absolute -inset-[70%]"
        style={{
          "--ds-tile": "34px",
          backgroundImage: "radial-gradient(rgb(var(--editorial-cream-rgb) / 0.72) 0.5px, transparent 1px)",
          backgroundSize: "34px 34px",
          opacity: phase.stars ? 0.5 : 0.15,
        }}
      />
      <div
        className="ds-drift-slow absolute -inset-[70%]"
        style={{
          "--ds-tile": "98px",
          backgroundImage: "radial-gradient(rgb(var(--editorial-gold-rgb) / 0.6) 0.7px, transparent 1.3px)",
          backgroundSize: "98px 98px",
          opacity: phase.stars ? 0.4 : 0.14,
        }}
      />

      {/* The orbit: a single hairline circle, half off the plate, so the cover has a
          horizon of its own without ever drawing attention to it. */}
      <div
        className="absolute -right-[16%] -top-[52%] aspect-square w-[82%] rounded-full"
        style={{
          border: "1px solid rgb(var(--editorial-gold-rgb) / 0.11)",
          boxShadow: "inset 0 0 150px rgb(var(--editorial-gold-rgb) / 0.05)",
        }}
      />
      <div
        className="absolute -right-[16%] -top-[52%] aspect-square w-[82%] rounded-full"
        style={{ boxShadow: "0 0 90px rgb(var(--editorial-gold-rgb) / 0.05)" }}
      />

      <div className="ds-sheen absolute inset-0" />

      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 190px rgba(3,6,13,0.62)" }} />
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(180deg, rgba(3,6,13,0) 0%, rgba(3,6,13,0.58) 100%)" }}
      />
    </div>
  );
}