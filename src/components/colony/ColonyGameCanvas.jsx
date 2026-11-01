import { useEffect, useRef, useCallback } from 'react';
import { zoneAt } from './colonyZones';

// ─── The Expo Hub map: one illustrated top-down plate, walked on a grid ───────
const MAP_URL = 'https://media.base44.com/images/public/68996845be6727838fdb822e/da8f08016_AerospaceExpoHub_Top100.png';
const SCALE = 2;              // the plate is drawn at twice its native size
const WORLD_W = 1024 * SCALE;
const WORLD_H = 576 * SCALE;
const CELL = 32;
const COLS = Math.floor(WORLD_W / CELL);
const ROWS = Math.floor(WORLD_H / CELL);
const START = { col: Math.floor(COLS / 2), row: Math.floor(ROWS * 0.72) };

const mapImage = typeof Image !== 'undefined' ? new Image() : null;
if (mapImage) mapImage.src = MAP_URL;

const cellCenter = (col, row) => ({ x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 });
const clampCol = (c) => Math.max(0, Math.min(COLS - 1, c));
const clampRow = (r) => Math.max(0, Math.min(ROWS - 1, r));

function drawSprite(ctx, x, y, color, label, isLocal) {
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 12, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, 13, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = isLocal ? '#ffffff' : 'rgba(255,255,255,0.6)';
  ctx.lineWidth = isLocal ? 2.5 : 1.5;
  ctx.stroke();

  const initials = (label || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isLocal ? 11 : 9}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, x, y);

  if (label) {
    const name = label.split(' ')[0];
    ctx.font = '11px sans-serif';
    const w = ctx.measureText(name).width + 10;
    ctx.fillStyle = 'rgba(14,24,41,0.8)';
    ctx.fillRect(x - w / 2, y - 34, w, 16);
    ctx.fillStyle = '#faf8f5';
    ctx.fillText(name, x, y - 26);
  }
}

export default function ColonyGameCanvas({ sprites = [], localSessionId = null, positions = {}, onMove, onZoneChange }) {
  const lastPosRef = useRef(null);
  const zoneRef = useRef(null);
  const cbRef = useRef({});
  cbRef.current = { onMove, onZoneChange };
  const canvasRef = useRef(null);
  const stateRef = useRef({
    camX: 0, camY: 0,
    playerCol: START.col, playerRow: START.row,
    keys: {}, lastTime: 0, moveAccum: 0, initialized: false,
  });
  const rafRef = useRef(null);

  // Camera centred on the player, held inside the plate's edges.
  const clampCam = (cx, cy, W, H) => ({
    x: WORLD_W <= W ? WORLD_W / 2 : Math.max(W / 2, Math.min(WORLD_W - W / 2, cx)),
    y: WORLD_H <= H ? WORLD_H / 2 : Math.max(H / 2, Math.min(WORLD_H - H / 2, cy)),
  });

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;
    const W = canvas.width, H = canvas.height;
    const ox = W / 2 - s.camX, oy = H / 2 - s.camY;

    ctx.fillStyle = '#0e1829';
    ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;
    if (mapImage?.complete && mapImage.naturalWidth) ctx.drawImage(mapImage, ox, oy, WORLD_W, WORLD_H);

    const all = [
      { col: s.playerCol, row: s.playerRow, color: '#1e3a5a', label: 'You', isLocal: true },
      ...sprites.map((p, i) => ({
        col: positions[p.session_id]?.col ?? clampCol(START.col + i + 1),
        row: positions[p.session_id]?.row ?? clampRow(START.row + 1),
        color: ['#b87333', '#c9a87c', '#4a6f99', '#8f5c2c'][i % 4],
        label: p.user_name || 'Participant',
        isLocal: p.session_id === localSessionId,
      })),
    ];
    all.sort((a, b) => a.row - b.row).forEach(p => {
      const { x, y } = cellCenter(p.col, p.row);
      drawSprite(ctx, x + ox, y + oy, p.color, p.label, p.isLocal);
    });
  }, [sprites, localSessionId, positions]);

  const loop = useCallback((time) => {
    const s = stateRef.current;
    const dt = Math.min(time - s.lastTime, 100);
    s.lastTime = time;
    s.moveAccum += dt;
    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(loop); return; }

    const target = cellCenter(s.playerCol, s.playerRow);
    if (!s.initialized && canvas.width > 0) {
      const c = clampCam(target.x, target.y, canvas.width, canvas.height);
      s.camX = c.x; s.camY = c.y; s.initialized = true;
    }

    if (s.moveAccum >= 120) {
      s.moveAccum = 0;
      let dc = 0, dr = 0;
      if (s.keys.ArrowUp || s.keys.w) dr -= 1;
      if (s.keys.ArrowDown || s.keys.s) dr += 1;
      if (s.keys.ArrowLeft || s.keys.a) dc -= 1;
      if (s.keys.ArrowRight || s.keys.d) dc += 1;
      s.playerCol = clampCol(s.playerCol + dc);
      s.playerRow = clampRow(s.playerRow + dr);
    }

    const key = `${s.playerCol},${s.playerRow}`;
    if (lastPosRef.current !== key) {
      lastPosRef.current = key;
      cbRef.current.onMove?.(s.playerCol, s.playerRow);
      const zone = zoneAt(s.playerCol, s.playerRow);
      if (zone?.key !== zoneRef.current?.key) {
        zoneRef.current = zone;
        cbRef.current.onZoneChange?.(zone);
      }
    }

    const c = clampCam(target.x, target.y, canvas.width, canvas.height);
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
    const wx = e.clientX - rect.left - canvas.width / 2 + s.camX;
    const wy = e.clientY - rect.top - canvas.height / 2 + s.camY;
    if (wx < 0 || wy < 0 || wx >= WORLD_W || wy >= WORLD_H) return;
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