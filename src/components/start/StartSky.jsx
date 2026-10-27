// The hour's weather, over the phase's own sky. Three washes and nothing more:
// the glow the hour carries, a fine field of stars where it is dark enough to
// have them, and a vignette that settles the edges so the keys at the bottom of
// the picture keep their contrast.
export default function StartSky({ phase }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: phase.glow }} />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(rgb(var(--editorial-cream-rgb) / 0.55) 0.5px, transparent 1px)",
          backgroundSize: "30px 30px",
          opacity: phase.stars ? 0.34 : 0.10,
        }}
      />

      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 92px rgba(5,11,20,0.52)" }} />
      <div
        className="absolute inset-x-0 bottom-0 h-2/5"
        style={{ background: "linear-gradient(180deg, rgba(5,11,20,0) 0%, rgba(5,11,20,0.40) 100%)" }}
      />
    </div>
  );
}