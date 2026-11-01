import { useEffect, useRef, useCallback } from 'react';
import { drawAvatar } from '@/components/colony/colonyAvatar';

// ─── The Expo Hub map: one illustrated top-down plate, walked on a grid ───────
// Everything is measured in the plate's native pixels (1024×576, 16px cells) and
// scaled at draw time, so the whole height of the plate fits the screen.
import { pickSpawn } from './colonySpawn';
const NATIVE_W = 1024;
const NATIVE_H = 576;
const CELL = 16;
const COLS = NATIVE_W / CELL;
const ROWS = NATIVE_H / CELL;
const START = { col: Math.floor(COLS / 2), row: Math.floor(ROWS * 0.85) };

const images = {};
const getImage = (url) => {
  if (typeof Image === 'undefined') return null;
  if (!images[url]) { images[url] = new Image(); images[url].src = url; }
  return images[url];
};

const cellCenter = (col, row) => ({ x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 });
const clampCol = (c) => Math.max(0, Math.min(COLS - 1, c));
const clampRow = (r) => Math.max(0, Math.min(ROWS - 1, r));
import { stepCast } from './npcBrain';

const zoneAt = (zones, col, row) =>
  zones.find(z => col >= z.col && col < z.col + z.w && row >= z.row && row < z.row + z.h) || null;

// A generated portrait, keyed out: the flat background colour (read from the corners)
// becomes transparent and the figure is trimmed to its own bounds. Cached per URL.
const spriteCache = {};
const getSprite = (url) => {
  if (typeof Image === 'undefined') return null;
  if (spriteCache[url] !== undefined) return spriteCache[url];
  spriteCache[url] = null;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const w = 128, h = Math.round(128 * img.naturalHeight / img.naturalWidth);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(img, 0, 0, w, h);
    let data;
    try { data = x.getImageData(0, 0, w, h); } catch { spriteCache[url] = c; return; }
    const d = data.data;
    const corners = [0, w - 1, (h - 1) * w, h * w - 1].map(i => [d[i * 4], d[i * 4 + 1], d[i * 4 + 2]]);
    const bg = corners.reduce((a, b) => a.map((v, i) => v + b[i] / 4), [0, 0, 0]);
    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (let i = 0; i < w * h; i++) {
      const dist = Math.abs(d[i * 4] - bg[0]) + Math.abs(d[i * 4 + 1] - bg[1]) + Math.abs(d[i * 4 + 2] - bg[2]);
      if (dist < 60) d[i * 4 + 3] = 0;
      else { const px = i % w, py = (i / w) | 0; minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); }
    }
    x.putImageData(data, 0, 0);
    if (maxX <= minX) { spriteCache[url] = c; return; }
    const t = document.createElement('canvas');
    t.width = maxX - minX + 1; t.height = maxY - minY + 1;
    t.getContext('2d').drawImage(c, minX, minY, t.width, t.height, 0, 0, t.width, t.height);
    spriteCache[url] = t;
  };
  img.src = url;
  return null;
};

// Hotspots: a copper beacon over each place you can visit, lit up when you stand in it.
function drawHotspots(ctx, zones, activeKey, ox, oy, sc, now) {
  (zones || []).filter(z => !z.npc).forEach(z => {
    const on = z.key === activeKey;
    const x = ox + z.col * CELL * sc, y = oy + z.row * CELL * sc;
    const w = z.w * CELL * sc, h = z.h * CELL * sc;
    const pulse = 0.5 + 0.5 * Math.sin(now / 600 + z.col);
    ctx.save();
    if (on) {
      ctx.fillStyle = 'rgba(201,168,124,0.16)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(201,168,124,0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }
    // The beacon: a diamond floating over the spot.
    const bx = Math.round(x + w / 2), by = Math.round(y + h / 2 - (on ? 0 : pulse * 3 * sc));
    const r = Math.max(5, 5 * sc) * (on ? 1.3 : 1);
    ctx.shadowColor = 'rgba(201,168,124,0.9)';
    ctx.shadowBlur = 8 + pulse * 10;
    ctx.fillStyle = on ? '#C9A87C' : `rgba(184,115,51,${0.65 + pulse * 0.35})`;
    ctx.beginPath();
    ctx.moveTo(bx, by - r); ctx.lineTo(bx + r, by); ctx.lineTo(bx, by + r); ctx.lineTo(bx - r, by);
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    if (on) {
      const fs = Math.max(11, Math.round(6 * sc));
      ctx.font = `600 ${fs}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const tw = Math.round(ctx.measureText(z.label).width + 14);
      const ty = by - r - fs - 6;
      ctx.fillStyle = 'rgba(30,58,90,0.92)';
      ctx.fillRect(bx - Math.round(tw / 2), ty - Math.round(fs / 2) - 4, tw, fs + 8);
      ctx.fillStyle = '#B87333';
      ctx.fillRect(bx - Math.round(tw / 2), ty + Math.round(fs / 2) + 3, tw, 1);
      ctx.fillStyle = '#FAF8F5';
      ctx.fillText(z.label, bx, ty);
    }
    ctx.restore();
  });
}

// Sprites are sized in map cells, so they scale with the plate on every screen.
function drawSprite(ctx, x, y, avatar, facing, label, sc0, depth = 1, tall = 1, walk = null, meta = {}) {
  const sc = sc0 * depth;
  const cell = CELL * sc;
  const spr = avatar?.image && getSprite(avatar.image);
  const top = y + cell * 0.5 - cell * 2.1 * tall;
  // Stretch the figure upward from its feet.
  ctx.save();
  // Mid-stride: a step bob, a sway from side to side, and a squash on each footfall.
  const bob = walk === null ? 0 : -Math.abs(Math.sin(walk)) * cell * 0.04;
  const sway = walk === null ? 0 : Math.sin(walk) * 0.02;
  // Standing still, the cast breathes; mid-step, each footfall squashes the figure a touch.
  const t = meta.now || 0;
  const squash = walk !== null ? 1 - Math.abs(Math.cos(walk)) * 0.035 : meta.npc ? 1 + Math.sin(t / 520 + x) * 0.012 : 1;
  ctx.translate(x, y + cell * 0.5 + bob);
  ctx.rotate(sway);
  ctx.scale(1 / squash, tall * squash);
  ctx.translate(-x, -(y + cell * 0.5 + bob));
  if (spr) {
    const h = cell * 2.1, w = h * spr.width / spr.height;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.beginPath();
    ctx.ellipse(x, y + cell * 0.45, w * 0.4, cell * 0.15, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    // Facing: the portrait turns to the side it is walking or talking towards; a chat adds a nod.
    if (facing === 'left') { ctx.translate(x * 2, 0); ctx.scale(-1, 1); }
    if (meta.line) { const nod = Math.sin(t / 180) * 0.03; ctx.translate(x, y + cell * 0.5); ctx.rotate(nod); ctx.translate(-x, -(y + cell * 0.5)); }
    ctx.drawImage(spr, x - w / 2, y + cell * 0.5 - h, w, h);
    ctx.restore();
    if (meta.line) {
      ctx.save();
      const bx = x + w * 0.35, by = y + cell * 0.5 - h - cell * 0.1;
      ctx.font = `700 ${Math.max(10, Math.round(cell * 0.35))}px sans-serif`;
      const tw = ctx.measureText(meta.line).width + 10, th = Math.max(14, cell * 0.5);
      ctx.fillStyle = '#faf8f5'; ctx.strokeStyle = '#B87333'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by - th, tw, th, 6) : ctx.rect(bx, by - th, tw, th); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#1e3a5a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(meta.line, bx + tw / 2, by - th / 2);
      ctx.restore();
    }
  } else drawAvatar(ctx, x, y, avatar, facing, Math.max(1.5, sc * 1.2));
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (label) {
    // The nameplate: a navy plate with a copper rule, the name in serif and, for staff, the role in gold.
    // Compact and capped: the plate never outgrows the figure it names.
    // Proximity: plates grow as you walk up to someone (prox 0 far → 1 beside you).
    const prox = meta.prox ?? 1;
    const fs = Math.round(Math.max(10, Math.min(16, cell * 0.4)) * (0.82 + 0.32 * prox));
    const ss = Math.max(7, Math.round(fs * 0.68));
    if (label.length > 18) label = `${label.slice(0, 17)}…`;
    ctx.font = `600 ${fs}px Georgia, serif`;
    const nw = ctx.measureText(label).width;
    ctx.font = `700 ${ss}px sans-serif`;
    const rw = meta.sub ? ctx.measureText(meta.sub.toUpperCase()).width : 0;
    const w = Math.round(Math.max(nw, rw) + 10), h = meta.sub ? fs + ss + 7 : fs + 6;
    // Whole pixels: a tag drawn on fractions shimmers as the camera glides.
    const lx = Math.round(x - w / 2);
    let ly = Math.round(top - h - 2);
    // Stack instead of overlapping: lift this plate above any already drawn where it would sit.
    const tags = meta.plates || [];
    for (let i = 0; i < 6; i += 1) {
      const hit = tags.find(p => p.tag && lx < p.tag.x + p.tag.w && lx + w > p.tag.x && ly < p.tag.y + p.tag.h && ly + h > p.tag.y);
      if (!hit) break;
      ly = hit.tag.y - h - 1;
    }
    ctx.fillStyle = meta.me ? 'rgba(184,115,51,0.92)' : 'rgba(14,24,41,0.9)';
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(lx, ly, w, h, 4) : ctx.rect(lx, ly, w, h); ctx.fill();
    ctx.strokeStyle = meta.sub ? '#C9A87C' : 'rgba(184,115,51,0.85)';
    ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#B87333';
    ctx.fillRect(lx + 4, ly + h - 2, w - 8, 1);
    ctx.fillStyle = '#faf8f5';
    ctx.font = `600 ${fs}px Georgia, serif`;
    ctx.fillText(label, Math.round(x), ly + fs / 2 + 4);
    if (meta.sub) {
      ctx.fillStyle = '#C9A87C';
      ctx.font = `700 ${ss}px sans-serif`;
      ctx.fillText(meta.sub.toUpperCase(), Math.round(x), ly + fs + ss / 2 + 5);
    }
    meta.plates?.push({ id: meta.id, x: lx, y: ly, w, h: Math.max(h, top + cell * 2.1 * tall - ly), tag: { x: lx, y: ly, w, h } });
  }
}

export default function ColonyGameCanvas({ mapUrl, room = 'lobby', zones = [], sprites = [], localSessionId = null, positions = {}, onMove, onZoneChange, stickRef, myAvatar, start, walls = [], fromRoom = null, zoom = 1, npcs = [], onPlate }) {
  const lastPosRef = useRef(null);
  const zoneRef = useRef(null);
  const cbRef = useRef({});
  cbRef.current = { onMove, onZoneChange, zones, onPlate, npcs };
  const canvasRef = useRef(null);
  const stateRef = useRef({
    camX: 0, camY: 0, scale: 1,
    playerCol: START.col, playerRow: START.row,
    keys: {}, lastTime: 0, moveAccum: 0, initialized: false,
  });
  const rafRef = useRef(null);
  const occupiedRef = useRef(new Set());
  occupiedRef.current = new Set([
    ...walls.flatMap(w => Array.from({ length: w.w * w.h }, (_, i) => `${w.col + (i % w.w)},${w.row + Math.floor(i / w.w)}`)),
    ...sprites
      .filter(p => p.session_id !== localSessionId && positions[p.session_id] && (positions[p.session_id].room ?? 'lobby') === room)
      .map(p => `${positions[p.session_id].col},${positions[p.session_id].row}`),
  ]);

  // Each room sets where a visitor steps in; the Main Hall opens at its globe entrance.
  useEffect(() => {
    const others = [...occupiedRef.current].map(k => { const [col, row] = k.split(',').map(Number); return { col, row }; });
    const wallSet = new Set(walls.flatMap(w => Array.from({ length: w.w * w.h }, (_, i) => `${w.col + (i % w.w)},${w.row + Math.floor(i / w.w)}`)));
    const at = pickSpawn({
      roomDef: { zones, start }, fromRoom, occupied: occupiedRef.current,
      others: others.filter(o => !wallSet.has(`${o.col},${o.row}`)), cols: COLS, rows: ROWS, fallback: START,
    });
    stateRef.current.playerCol = at.col;
    stateRef.current.playerRow = at.row;
  }, [room]);

  // Fit the plate's full height (or width, whichever is larger) — the widest view
  // that still leaves no empty desk around it.
  // Half again closer than fit: immersive, with a few buildings still in view.
  // The lobby reads wide; the campus rooms closer. The visitor's own zoom multiplies both.
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  // Cover the screen, then zoom in — less on a wide desk, where covering already enlarges the plate.
  const fitScale = (W, H) => {
    const cover = Math.max(H / NATIVE_H, W / NATIVE_W);
    const wide = W / (window.devicePixelRatio || 1) >= 900;
    const close = room === 'lobby' ? (wide ? 1 : 1.2) : (wide ? 1.35 : 1.8);
    return cover * close * zoomRef.current;
  };

  // Camera (in native px) centred on the player, held inside the plate's edges.
  const clampCam = (cx, cy, W, H, sc) => {
    const vw = W / sc, vh = H / sc;
    return {
      x: NATIVE_W <= vw ? NATIVE_W / 2 : Math.max(vw / 2, Math.min(NATIVE_W - vw / 2, cx)),
      y: NATIVE_H <= vh ? NATIVE_H / 2 : Math.max(vh / 2, Math.min(NATIVE_H - vh / 2, cy)),
    };
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    const W = canvas.width, H = canvas.height, sc = s.scale;
    const ox = W / 2 - s.camX * sc, oy = H / 2 - s.camY * sc;

    ctx.fillStyle = '#0e1829';
    ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = true;
    const img = getImage(mapUrl);
    if (img?.complete && img.naturalWidth) ctx.drawImage(img, ox, oy, NATIVE_W * sc, NATIVE_H * sc);
    drawHotspots(ctx, cbRef.current.zones, zoneRef.current?.key, ox, oy, sc, performance.now());

    const all = [
      { id: 'me', col: s.vCol ?? s.playerCol, row: s.vRow ?? s.playerRow, avatar: myAvatar, facing: s.facing, label: 'You' },
      ...(() => {
        // The cast runs errands, looks around, and stops to chat with colleagues nearby.
        if (s.brainRoom !== room) { s.brain = {}; s.brainRoom = room; }
        const occ = occupiedRef.current;
        stepCast(npcs, s.brain, performance.now(), (c, r) => c < 0 || r < 0 || c >= COLS || r >= ROWS || occ.has(`${c},${r}`)
          || (c === s.playerCol && r === s.playerRow));
        return npcs.map((n) => {
          const b = s.brain[n.id];
          return { id: `npc-${n.id}`, col: b.col, row: b.row, avatar: { image: n.sprite }, facing: b.facing, label: n.name, sub: n.role, line: b.mode === 'chat' ? b.line : null, npc: true };
        });
      })(),
      ...sprites.filter(p => (positions[p.session_id]?.room ?? 'lobby') === room).map((p, i) => ({
        id: p.session_id,
        col: positions[p.session_id]?.col ?? clampCol(START.col + i + 1),
        row: positions[p.session_id]?.row ?? clampRow(START.row),
        avatar: positions[p.session_id]?.avatar,
        facing: positions[p.session_id]?.facing || 'down',
        label: p.user_name || 'Participant',
      })),
    ];
    // Walking: anyone whose cell changed in the last moment is mid-stride.
    const now = performance.now();
    const plates = [];
    s.seen = s.seen || {};
    all.sort((a, b) => a.row - b.row).forEach(p => {
      const k = `${p.col},${p.row}`;
      const seen = s.seen[p.id];
      if (!seen || seen.k !== k) s.seen[p.id] = { k, at: seen ? now : 0 };
      const walk = now - s.seen[p.id].at < 260 ? now / 120 : null;
      // Glide between cells instead of snapping, so the figure and its tag move as one.
      const tgt = cellCenter(p.col, p.row);
      s.disp = s.disp || {};
      const d = s.disp[p.id] || (s.disp[p.id] = { ...tgt });
      // Constant walking speed (one cell per step interval), so strides never surge and stall.
      const dx = tgt.x - d.x, dy = tgt.y - d.y, dist = Math.hypot(dx, dy);
      const stepPx = (CELL / 240) * (s.frameDt || 16.7);
      if (dist <= stepPx || dist > CELL * 4) { d.x = tgt.x; d.y = tgt.y; }
      else { d.x += (dx / dist) * stepPx; d.y += (dy / dist) * stepPx; }
      const { x, y } = d;
      // The lobby is drawn in perspective: further back (higher up) reads smaller.
      const depth = room === 'lobby' ? 1.3 + 1.85 * Math.pow(p.row / (ROWS - 1), 1.4) : 1;
      drawSprite(ctx, ox + x * sc, oy + y * sc, p.avatar, p.facing, p.label, sc, depth, room === 'lobby' ? 1.3 : 1, walk,
        { sub: p.sub, id: p.id, me: p.id === 'me', plates, line: p.line, npc: p.npc, now,
          prox: p.id === 'me' ? 0.6 : Math.max(0, 1 - Math.hypot(p.col - s.playerCol, p.row - s.playerRow) / 10) });
    });
    s.plates = plates;

    // Room transition: the new room opens out of a closing iris of dark.
    if (!s.born) s.born = performance.now();
    const t = Math.min(1, (performance.now() - s.born) / 700);
    if (t < 1) {
      const e = 1 - Math.pow(1 - t, 3);
      const r = Math.hypot(W, H) * e;
      ctx.save();
      ctx.fillStyle = `rgba(14,24,41,${1 - e * 0.6})`;
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(W / 2, H / 2, Math.max(1, r), 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      ctx.restore();
    }
  }, [mapUrl, room, sprites, positions, myAvatar]);

  const loop = useCallback((time) => {
    const s = stateRef.current;
    const dt = Math.min(time - s.lastTime, 100);
    s.lastTime = time;
    s.frameDt = dt;
    s.moveAccum += dt;
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(loop); return; }
    s.scale = fitScale(canvas.width, canvas.height) || 1;

    const target = cellCenter(s.playerCol, s.playerRow);
    if (!s.initialized && canvas.width > 0) {
      const c = clampCam(target.x, target.y, canvas.width, canvas.height, s.scale);
      s.camX = c.x; s.camY = c.y; s.initialized = true;
    }

    if (s.moveAccum >= 240) {
      s.moveAccum = 0;
      let dc = 0, dr = 0;
      const stick = stickRef?.current || {};
      if (s.keys.ArrowUp || s.keys.w || stick.up) dr -= 1;
      if (s.keys.ArrowDown || s.keys.s || stick.down) dr += 1;
      if (s.keys.ArrowLeft || s.keys.a || stick.left) dc -= 1;
      if (s.keys.ArrowRight || s.keys.d || stick.right) dc += 1;
      if (dr) s.facing = dr < 0 ? 'up' : 'down';
      if (dc) s.facing = dc < 0 ? 'left' : 'right';
      // No two people share a cell: a step into someone else's square is refused.
      const nc = clampCol(s.playerCol + dc), nr = clampRow(s.playerRow + dr);
      const occ = occupiedRef.current;
      if (!occ.has(`${nc},${nr}`)) { s.playerCol = nc; s.playerRow = nr; }
      else if (!occ.has(`${nc},${s.playerRow}`)) s.playerCol = nc;
      else if (!occ.has(`${s.playerCol},${nr}`)) s.playerRow = nr;
    }

    const key = `${s.playerCol},${s.playerRow}`;
    if (lastPosRef.current !== key) {
      lastPosRef.current = key;
      cbRef.current.onMove?.(s.playerCol, s.playerRow, s.facing || 'down');
      // A door underfoot wins; otherwise the nearest character within reach offers to talk.
      let zone = zoneAt(cbRef.current.zones, s.playerCol, s.playerRow);
      if (!zone) {
        const near = cbRef.current.npcs
          .map(n => { const b = s.brain?.[n.id] || n; return { n, d: Math.hypot(b.col - s.playerCol, b.row - s.playerRow) }; })
          .filter(x => x.d <= 2.5).sort((a, b) => a.d - b.d)[0];
        if (near) zone = { key: `npc-${near.n.id}`, npc: near.n.id, label: `Talk to ${near.n.name}` };
      }
      if (zone?.key !== zoneRef.current?.key) {
        zoneRef.current = zone;
        cbRef.current.onZoneChange?.(zone);
      }
    }

    // The sprite walks between cells at the step rate instead of hopping, and a jump of more
    // than two cells (a spawn or a tap-to-walk) lands at once.
    const step = dt / 240;
    const glide = (v, t) => (v == null || Math.abs(t - v) > 2) ? t : v + Math.sign(t - v) * Math.min(Math.abs(t - v), step);
    s.vCol = glide(s.vCol, s.playerCol);
    s.vRow = glide(s.vRow, s.playerRow);
    const seen = cellCenter(s.vCol, s.vRow);
    const c = clampCam(seen.x, seen.y, canvas.width, canvas.height, s.scale);
    // Same glide at any frame rate, and snap when close so the picture settles dead still.
    const k = 1 - Math.pow(0.82, dt / 16.7);
    s.camX += (c.x - s.camX) * k;
    s.camY += (c.y - s.camY) * k;
    if (Math.abs(c.x - s.camX) < 0.05) s.camX = c.x;
    if (Math.abs(c.y - s.camY) < 0.05) s.camY = c.y;

    render();
    rafRef.current = requestAnimationFrame(loop);
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      // Drawn at device resolution so a desk's retina screen stays sharp.
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(parent.clientWidth * dpr);
      canvas.height = Math.round(parent.clientHeight * dpr);
    };
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; setSize(); });
    };
    setSize();
    const observer = new ResizeObserver(schedule);
    observer.observe(canvas.parentElement);
    return () => { if (frame) cancelAnimationFrame(frame); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      stateRef.current.keys[e.key] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    };
    const onKeyUp = (e) => { stateRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const s = stateRef.current;
    const dpr = canvas.width / rect.width;
    // A tap on a nameplate (or the figure under it) opens that person rather than walking.
    const px = (e.clientX - rect.left) * dpr, py = (e.clientY - rect.top) * dpr;
    const hit = [...(s.plates || [])].reverse().find(p => p.id !== 'me' && px >= p.x && px <= p.x + p.w && py >= p.y && py <= p.y + p.h);
    if (hit) { cbRef.current.onPlate?.(hit.id); return; }
    const wx = ((e.clientX - rect.left) * dpr - canvas.width / 2) / s.scale + s.camX;
    const wy = ((e.clientY - rect.top) * dpr - canvas.height / 2) / s.scale + s.camY;
    if (wx < 0 || wy < 0 || wx >= NATIVE_W || wy >= NATIVE_H) return;
    s.playerCol = clampCol(Math.floor(wx / CELL));
    s.playerRow = clampRow(Math.floor(wy / CELL));
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      aria-label="Colony map"
      className="w-full h-full block cursor-pointer outline-none focus:ring-2 focus:ring-editorial-copper"
      tabIndex={0}
    />
  );
}