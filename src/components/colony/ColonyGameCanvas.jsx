import { useEffect, useRef, useCallback } from 'react';

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

function drawSprite(ctx, x, y, color, label, isLocal) {
  ctx.beginPath();
  ctx.ellipse(x, y + 9, 9, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = isLocal ? '#ffffff' : 'rgba(255,255,255,0.6)';
  ctx.lineWidth = isLocal ? 2 : 1.5;
  ctx.stroke();

  const initials = (label || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, x, y);

  if (label) {
    const name = label.split(' ')[0];
    ctx.font = '10px sans-serif';
    const w = ctx.measureText(name).width + 8;
    ctx.fillStyle = 'rgba(14,24,41,0.8)';
    ctx.fillRect(x - w / 2, y - 28, w, 14);
    ctx.fillStyle = '#faf8f5';
    ctx.fillText(name, x, y - 21);
  }
}

export default function ColonyGameCanvas({ mapUrl, room = 'hall', zones = [], sprites = [], localSessionId = null, positions = {}, onMove, onZoneChange, stickRef }) {
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

    const all = [
      { col: s.playerCol, row: s.playerRow, color: '#1e3a5a', label: 'You', isLocal: true },
      ...sprites.filter(p => (positions[p.session_id]?.room ?? 'hall') === room).map((p, i) => ({
        col: positions[p.session_id]?.col ?? clampCol(START.col + i + 1),
        row: positions[p.session_id]?.row ?? clampRow(START.row),
        color: ['#b87333', '#c9a87c', '#4a6f99', '#8f5c2c'][i % 4],
        label: p.user_name || 'Participant',
        isLocal: p.session_id === localSessionId,
      })),
    ];
    all.sort((a, b) => a.row - b.row).forEach(p => {
      const { x, y } = cellCenter(p.col, p.row);
      drawSprite(ctx, ox + x * sc, oy + y * sc, p.color, p.label, p.isLocal);
    });
  }, [mapUrl, room, sprites, localSessionId, positions]);

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
      s.playerCol = clampCol(s.playerCol + dc);
      s.playerRow = clampRow(s.playerRow + dr);
    }

    const key = `${s.playerCol},${s.playerRow}`;
    if (lastPosRef.current !== key) {
      lastPosRef.current = key;
      cbRef.current.onMove?.(s.playerCol, s.playerRow);
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
      aria-label="Aerospace Expo Hub map"
      className="w-full h-full block cursor-pointer outline-none focus:ring-2 focus:ring-editorial-copper"
      tabIndex={0}
    />
  );
}