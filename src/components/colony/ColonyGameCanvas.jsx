import React, { useEffect, useRef, useCallback } from 'react';

// ─── Isometric projection constants ───────────────────────────────────────────
const TILE_W = 64;   // tile width  (diamond base width)
const TILE_H = 32;   // tile height (diamond base height)
const TILE_DEPTH = 16; // visual depth for tile sides

// ─── Convert grid (col, row) → screen (x, y) ──────────────────────────────────
function gridToScreen(col, row, camX, camY, canvasW, canvasH) {
  const sx = (col - row) * (TILE_W / 2) + canvasW / 2 - camX;
  const sy = (col + row) * (TILE_H / 2) + canvasH / 4 - camY;
  return { x: sx, y: sy };
}

// ─── Draw a single flat isometric tile ────────────────────────────────────────
function drawTile(ctx, sx, sy, fillTop, fillLeft, fillRight) {
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;

  // Top face
  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + hw, sy + hh);
  ctx.lineTo(sx, sy + TILE_H);
  ctx.lineTo(sx - hw, sy + hh);
  ctx.closePath();
  ctx.fillStyle = fillTop;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Left face
  ctx.beginPath();
  ctx.moveTo(sx - hw, sy + hh);
  ctx.lineTo(sx, sy + TILE_H);
  ctx.lineTo(sx, sy + TILE_H + TILE_DEPTH);
  ctx.lineTo(sx - hw, sy + hh + TILE_DEPTH);
  ctx.closePath();
  ctx.fillStyle = fillLeft;
  ctx.fill();
  ctx.stroke();

  // Right face
  ctx.beginPath();
  ctx.moveTo(sx + hw, sy + hh);
  ctx.lineTo(sx, sy + TILE_H);
  ctx.lineTo(sx, sy + TILE_H + TILE_DEPTH);
  ctx.lineTo(sx + hw, sy + hh + TILE_DEPTH);
  ctx.closePath();
  ctx.fillStyle = fillRight;
  ctx.fill();
  ctx.stroke();
}

// ─── Tile palette ──────────────────────────────────────────────────────────────
const TILE_TYPES = {
  grass:  { top: '#5a8a3c', left: '#3d6128', right: '#4a7230' },
  water:  { top: '#3a7bd5', left: '#2558a8', right: '#2d67bf' },
  stone:  { top: '#8a8a8a', left: '#5a5a5a', right: '#6e6e6e' },
  sand:   { top: '#c8b560', left: '#9e8e3a', right: '#b3a148' },
  path:   { top: '#b08050', left: '#7a5535', right: '#8e6640' },
};

// ─── Demo 16×16 map ────────────────────────────────────────────────────────────
const DEMO_MAP = [
  ['stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone'],
  ['stone','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','stone'],
  ['stone','grass','grass','grass','grass','grass','grass','path', 'grass','grass','grass','grass','grass','grass','grass','stone'],
  ['stone','grass','grass','water','water','grass','grass','path', 'grass','grass','water','water','grass','grass','grass','stone'],
  ['stone','grass','grass','water','water','grass','grass','path', 'grass','grass','water','water','grass','grass','grass','stone'],
  ['stone','grass','grass','grass','grass','grass','grass','path', 'grass','grass','grass','grass','grass','grass','grass','stone'],
  ['stone','grass','grass','grass','grass','sand', 'sand', 'path', 'sand', 'sand', 'grass','grass','grass','grass','grass','stone'],
  ['stone','path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path', 'path','stone'],
  ['stone','grass','grass','grass','grass','sand', 'sand', 'path', 'sand', 'sand', 'grass','grass','grass','grass','grass','stone'],
  ['stone','grass','grass','grass','grass','grass','grass','path', 'grass','grass','grass','grass','grass','grass','grass','stone'],
  ['stone','grass','grass','water','water','grass','grass','path', 'grass','grass','water','water','grass','grass','grass','stone'],
  ['stone','grass','grass','water','water','grass','grass','path', 'grass','grass','water','water','grass','grass','grass','stone'],
  ['stone','grass','grass','grass','grass','grass','grass','path', 'grass','grass','grass','grass','grass','grass','grass','stone'],
  ['stone','grass','grass','grass','grass','grass','grass','path', 'grass','grass','grass','grass','grass','grass','grass','stone'],
  ['stone','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','grass','stone'],
  ['stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone','stone'],
];

const MAP_ROWS = DEMO_MAP.length;
const MAP_COLS = DEMO_MAP[0].length;

// ─── Draw a sprite (avatar circle) at an iso grid position ────────────────────
function drawSprite(ctx, col, row, camX, camY, canvasW, canvasH, color, label, isLocal) {
  const { x, y } = gridToScreen(col, row, camX, camY, canvasW, canvasH);
  const cx = x;
  const cy = y + TILE_H / 2; // anchor to tile center

  // Shadow
  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 14, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  // Body circle
  ctx.beginPath();
  ctx.arc(cx, cy - 14, 14, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = isLocal ? '#ffffff' : 'rgba(255,255,255,0.5)';
  ctx.lineWidth = isLocal ? 2.5 : 1.5;
  ctx.stroke();

  // Initials
  const initials = (label || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isLocal ? 11 : 9}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, cx, cy - 14);

  // Name tag
  if (label) {
    ctx.font = '10px sans-serif';
    ctx.fillStyle = isLocal ? '#ffffff' : '#e0e0e0';
    ctx.textAlign = 'center';
    ctx.fillText(label.split(' ')[0], cx, cy - 32);
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ColonyGameCanvas({ sprites = [], localSessionId = null }) {
  const canvasRef = useRef(null);
  const stateRef  = useRef({
    camX: 0,
    camY: 0,
    playerCol: 7,
    playerRow: 7,
    keys: {},
    lastTime: 0,
    moveAccum: 0,
  });
  const rafRef = useRef(null);

  // ── Render one frame ──────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { camX, camY } = stateRef.current;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Sky / background
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(0, 0, W, H);

    // ── Draw tiles (painter's algorithm: row + col order for z-sort) ─────────
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tileKey = DEMO_MAP[row][col];
        const tile = TILE_TYPES[tileKey] || TILE_TYPES.grass;
        const { x, y } = gridToScreen(col, row, camX, camY, W, H);
        drawTile(ctx, x, y, tile.top, tile.left, tile.right);
      }
    }

    // ── Draw sprites at their grid positions ─────────────────────────────────
    // Sort by row+col for z-order
    const allSprites = [
      { col: stateRef.current.playerCol, row: stateRef.current.playerRow, color: '#6366f1', label: 'You', isLocal: true },
      ...sprites.map((s, i) => ({
        col: (7 + i + 1) % MAP_COLS,
        row: (7 + i + 1) % MAP_ROWS,
        color: ['#ec4899','#f59e0b','#10b981','#ef4444'][i % 4],
        label: s.user_name || 'Participant',
        isLocal: s.session_id === localSessionId,
      })),
    ];

    allSprites
      .sort((a, b) => (a.col + a.row) - (b.col + b.row))
      .forEach(s => drawSprite(ctx, s.col, s.row, camX, camY, W, H, s.color, s.label, s.isLocal));
  }, [sprites, localSessionId]);

  // ── Game loop ─────────────────────────────────────────────────────────────
  const loop = useCallback((time) => {
    const s = stateRef.current;
    const dt = time - s.lastTime;
    s.lastTime = time;
    s.moveAccum += dt;

    const MOVE_INTERVAL = 200; // ms per tile step
    if (s.moveAccum >= MOVE_INTERVAL) {
      s.moveAccum = 0;
      let dc = 0, dr = 0;
      if (s.keys['ArrowUp']    || s.keys['w']) { dc -= 1; dr -= 1; }
      if (s.keys['ArrowDown']  || s.keys['s']) { dc += 1; dr += 1; }
      if (s.keys['ArrowLeft']  || s.keys['a']) { dc -= 1; dr += 1; }
      if (s.keys['ArrowRight'] || s.keys['d']) { dc += 1; dr -= 1; }

      if (dc !== 0 || dr !== 0) {
        s.playerCol = Math.max(1, Math.min(MAP_COLS - 2, s.playerCol + dc));
        s.playerRow = Math.max(1, Math.min(MAP_ROWS - 2, s.playerRow + dr));
      }
    }

    // Camera lerp toward player
    const canvas = canvasRef.current;
    if (canvas) {
      const target = gridToScreen(s.playerCol, s.playerRow, 0, 0, canvas.width, canvas.height);
      s.camX += (target.x - canvas.width / 2) * 0.08;
      s.camY += (target.y - canvas.height / 4 - TILE_H) * 0.08;
    }

    render();
    rafRef.current = requestAnimationFrame(loop);
  }, [render]);

  // ── Resize canvas to fill container ──────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width  = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    setSize();
    const observer = new ResizeObserver(setSize);
    observer.observe(canvas.parentElement);

    return () => observer.disconnect();
  }, []);

  // ── Keyboard listeners ────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e) => {
      stateRef.current.keys[e.key] = true;
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => { stateRef.current.keys[e.key] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, []);

  // ── Start / stop RAF loop ─────────────────────────────────────────────────
  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ── Click-to-move ─────────────────────────────────────────────────────────
  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { camX, camY } = stateRef.current;
    const W = canvas.width;
    const H = canvas.height;

    // Inverse isometric projection
    const relX = mx - (W / 2 - camX);
    const relY = my - (H / 4 - camY);
    const col = Math.round((relX / (TILE_W / 2) + relY / (TILE_H / 2)) / 2);
    const row = Math.round((relY / (TILE_H / 2) - relX / (TILE_W / 2)) / 2);

    if (col >= 1 && col <= MAP_COLS - 2 && row >= 1 && row <= MAP_ROWS - 2) {
      stateRef.current.playerCol = col;
      stateRef.current.playerRow = row;
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      aria-label="Colony isometric world"
      className="w-full h-full block cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
      tabIndex={0}
    />
  );
}