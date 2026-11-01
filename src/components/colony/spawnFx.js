// Arrivals and departures: a copper-and-gold light column that a figure materialises out of,
// and collapses back into when they leave the room.
export const SPAWN_MS = 650;

export function drawBeam(ctx, x, y, cell, k, now) {
  // k: 0 → 1 strength of the column
  const h = cell * 3.2, w = cell * (0.5 + 0.5 * k);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(x, y - h, x, y + cell * 0.5);
  g.addColorStop(0, 'rgba(201,168,124,0)');
  g.addColorStop(0.6, `rgba(201,168,124,${0.45 * k})`);
  g.addColorStop(1, `rgba(184,115,51,${0.7 * k})`);
  ctx.fillStyle = g;
  ctx.fillRect(x - w / 2, y - h, w, h + cell * 0.5);
  ctx.beginPath();
  ctx.ellipse(x, y + cell * 0.45, cell * (0.4 + 0.5 * k), cell * 0.18, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(232,207,158,${0.6 * k})`;
  ctx.fill();
  for (let i = 0; i < 5; i += 1) {
    const py = y - ((now / 6 + i * 37) % h);
    ctx.fillStyle = `rgba(250,248,245,${0.8 * k})`;
    ctx.fillRect(x + Math.sin(i * 2.1 + now / 300) * w * 0.4, py, 2, 2);
  }
  ctx.restore();
}

// Track who just arrived and who just left, given everyone drawn this frame.
export function trackSpawns(s, people, now) {
  s.spawn = s.spawn || {};
  s.gone = s.gone || {};
  const ids = new Set(people.map(p => p.id));
  people.forEach(p => {
    if (!(p.id in s.spawn)) s.spawn[p.id] = s.ready ? now : 0;
    delete s.gone[p.id];
  });
  Object.entries(s.last || {}).forEach(([id, d]) => {
    if (!ids.has(id) && !s.gone[id]) s.gone[id] = { ...d, at: now };
  });
  Object.keys(s.spawn).forEach(id => { if (!ids.has(id)) delete s.spawn[id]; });
  Object.entries(s.gone).forEach(([id, g]) => { if (now - g.at > SPAWN_MS) delete s.gone[id]; });
}