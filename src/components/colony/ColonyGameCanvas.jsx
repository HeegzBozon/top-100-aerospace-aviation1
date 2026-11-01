import { useEffect, useRef, useCallback } from 'react';
import { drawAvatar } from '@/components/colony/colonyAvatar';

// ─── The Expo Hub map: one illustrated top-down plate, walked on a grid ───────
// Everything is measured in the plate's native pixels (1024×576, 16px cells) and
// scaled at draw time, so the whole height of the plate fits the screen.
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
  (zones || []).forEach(z => {
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
function drawSprite(ctx, x, y, avatar, facing, label, sc0, depth = 1, tall = 1, walk = null) {
  const sc = sc0 * depth;
  const cell = CELL * sc;
  const spr = avatar?.image && getSprite(avatar.image);
  const top = y + cell * 0.5 - cell * 2.1 * tall;
  // Stretch the figure upward from its feet.
  ctx.save();
  // Mid-stride: a step bob, a sway from side to side, and a squash on each footfall.
  const bob = walk === null ? 0 : -Math.abs(Math.sin(walk)) * cell * 0.18;
  const sway = walk === null ? 0 : Math.sin(walk) * 0.09;
  const squash = walk === null ? 1 : 1 - Math.abs(Math.cos(walk)) * 0.05;
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
    ctx.drawImage(spr, x - w / 2, y + cell * 0.5 - h, w, h);
    ctx.restore();
  } else drawAvatar(ctx, x, y, avatar, facing, Math.max(1.5, sc * 1.2));
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (label) {
    const name = label.split(' ')[0];
    const fs = Math.max(10, Math.round(cell * 0.6));
    ctx.font = `${fs}px sans-serif`;
    const w = Math.round(ctx.measureText(name).width + 8);
    // Whole pixels: a tag drawn on fractions shimmers as the camera glides.
    const lx = Math.round(x), ly = Math.round(top);
    ctx.fillStyle = 'rgba(14,24,41,0.8)';
    ctx.fillRect(lx - Math.round(w / 2), ly - fs - 4, w, fs + 4);
    ctx.fillStyle = '#faf8f5';
    ctx.fillText(name, lx, ly - Math.round(fs / 2) - 2);
  }
}

export default function ColonyGameCanvas({ mapUrl, room = 'lobby', zones = [], sprites = [], localSessionId = null, positions = {}, onMove, onZoneChange, stickRef, myAvatar, start }) {
  const lastPosRef = useRef(null);
  const zoneRef = useRef(null);
  const cbRef = useRef({});
  cbRef.current = { onMove, onZoneChange, zones };
  const canvasRef = useRef(null);
  const stateRef = useRef({
    camX: 0, camY: 0, scale: 1,
    playerCol: START.col, playerRow: START.row,
    keys: {}, lastTime: 0, moveAccum: 0, initialized: false,
  });
  const rafRef = useRef(null);

  // Each room sets where a visitor steps in; the Main Hall opens at its globe entrance.
  useEffect(() => {
    const at = start || START;
    stateRef.current.playerCol = at.col;
    stateRef.current.playerRow = at.row;
  }, [room]);

  // Fit the plate's full height (or width, whichever is larger) — the widest view
  // that still leaves no empty desk around it.
  // Half again closer than fit: immersive, with a few buildings still in view.
  const fitScale = (W, H) => Math.max(H / NATIVE_H, W / NATIVE_W) * 1.5;

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
      { id: 'me', col: s.playerCol, row: s.playerRow, avatar: myAvatar, facing: s.facing, label: 'You' },
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
    s.seen = s.seen || {};
    all.sort((a, b) => a.row - b.row).forEach(p => {
      const k = `${p.col},${p.row}`;
      const seen = s.seen[p.id];
      if (!seen || seen.k !== k) s.seen[p.id] = { k, at: seen ? now : 0 };
      const walk = now - s.seen[p.id].at < 260 ? now / 85 : null;
      // Glide between cells instead of snapping, so the figure and its tag move as one.
      const tgt = cellCenter(p.col, p.row);
      s.disp = s.disp || {};
      const d = s.disp[p.id] || (s.disp[p.id] = { ...tgt });
      d.x += (tgt.x - d.x) * 0.3; d.y += (tgt.y - d.y) * 0.3;
      const { x, y } = d;
      // The lobby is drawn in perspective: further back (higher up) reads smaller.
      const depth = room === 'lobby' ? 1.3 + 1.85 * Math.pow(p.row / (ROWS - 1), 1.4) : 1;
      drawSprite(ctx, ox + x * sc, oy + y * sc, p.avatar, p.facing, p.label, sc, depth, room === 'lobby' ? 1.3 : 1, walk);
    });

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
    s.moveAccum += dt;
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(loop); return; }
    s.scale = fitScale(canvas.width, canvas.height) || 1;

    const target = cellCenter(s.playerCol, s.playerRow);
    if (!s.initialized && canvas.width > 0) {
      const c = clampCam(target.x, target.y, canvas.width, canvas.height, s.scale);
      s.camX = c.x; s.camY = c.y; s.initialized = true;
    }

    if (s.moveAccum >= 90) {
      s.moveAccum = 0;
      let dc = 0, dr = 0;
      const stick = stickRef?.current || {};
      if (s.keys.ArrowUp || s.keys.w || stick.up) dr -= 1;
      if (s.keys.ArrowDown || s.keys.s || stick.down) dr += 1;
      if (s.keys.ArrowLeft || s.keys.a || stick.left) dc -= 1;
      if (s.keys.ArrowRight || s.keys.d || stick.right) dc += 1;
      if (dr) s.facing = dr < 0 ? 'up' : 'down';
      if (dc) s.facing = dc < 0 ? 'left' : 'right';
      s.playerCol = clampCol(s.playerCol + dc);
      s.playerRow = clampRow(s.playerRow + dr);
    }

    const key = `${s.playerCol},${s.playerRow}`;
    if (lastPosRef.current !== key) {
      lastPosRef.current = key;
      cbRef.current.onMove?.(s.playerCol, s.playerRow, s.facing || 'down');
      const zone = zoneAt(cbRef.current.zones, s.playerCol, s.playerRow);
      if (zone?.key !== zoneRef.current?.key) {
        zoneRef.current = zone;
        cbRef.current.onZoneChange?.(zone);
      }
    }

    const c = clampCam(target.x, target.y, canvas.width, canvas.height, s.scale);
    s.camX += (c.x - s.camX) * 0.1;
    s.camY += (c.y - s.camY) * 0.1;

    render();
    rafRef.current = requestAnimationFrame(loop);
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
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
    const wx = (e.clientX - rect.left - canvas.width / 2) / s.scale + s.camX;
    const wy = (e.clientY - rect.top - canvas.height / 2) / s.scale + s.camY;
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