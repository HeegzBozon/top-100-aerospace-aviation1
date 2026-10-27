// The face of every instrument on the deck: a 240° sweep with the reading
// straight up, laid out in the SVG's own 100x100 user units.
export const START = -120;
export const SWEEP = 240;

export const polar = (r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [50 + r * Math.cos(rad), 50 + r * Math.sin(rad)];
};

export const arcPath = (r, from, to) => {
  const [x1, y1] = polar(r, from);
  const [x2, y2] = polar(r, to);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${Math.abs(to - from) > 180 ? 1 : 0} 1 ${x2} ${y2}`;
};

export const needleDeg = (value, max) => {
  const frac = max > 0 ? Math.max(0, Math.min(1, (value || 0) / max)) : 0;
  return START + frac * SWEEP;
};