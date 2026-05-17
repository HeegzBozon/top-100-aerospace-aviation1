const STAT_KEYS = ['altitude', 'velocity', 'payload', 'range', 'resilience', 'maneuver'];
const STAT_LABELS = { altitude: 'ALT', velocity: 'VEL', payload: 'PAY', range: 'RNG', resilience: 'RES', maneuver: 'MAN' };
const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 80;
const LEVELS = 4;

function polarToXY(angle, r) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

export default function RadarChart({ stats }) {
  const angles = STAT_KEYS.map((_, i) => (i / STAT_KEYS.length) * 360);

  const points = STAT_KEYS.map((key, i) => {
    const val = stats[key] || 10;
    const r = (val / 20) * RADIUS;
    return polarToXY(angles[i], r);
  });

  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');

  const gridPolygons = Array.from({ length: LEVELS }, (_, lvl) => {
    const r = ((lvl + 1) / LEVELS) * RADIUS;
    return STAT_KEYS.map((_, i) => {
      const pt = polarToXY(angles[i], r);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  });

  const labelPositions = STAT_KEYS.map((key, i) => {
    const pt = polarToXY(angles[i], RADIUS + 18);
    return { key, ...pt };
  });

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
      {/* Grid rings */}
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* Spokes */}
      {STAT_KEYS.map((_, i) => {
        const outer = polarToXY(angles[i], RADIUS);
        return <line key={i} x1={CENTER} y1={CENTER} x2={outer.x} y2={outer.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}

      {/* Data polygon */}
      <polygon points={polygon} fill="rgba(201,168,124,0.15)" stroke="#c9a87c" strokeWidth="1.5" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#c9a87c" />
      ))}

      {/* Labels */}
      {labelPositions.map(({ key, x, y }) => (
        <text key={key} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.4)" fontSize="9" fontFamily="Montserrat, system-ui, sans-serif"
          fontWeight="700" letterSpacing="1">
          {STAT_LABELS[key]}
        </text>
      ))}
    </svg>
  );
}