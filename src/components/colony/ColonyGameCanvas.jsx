import React, { useEffect, useRef, useCallback } from 'react';

// ─── Isometric projection constants ───────────────────────────────────────────
const TILE_W = 64;
const TILE_H = 32;
const TILE_DEPTH = 14;

const MAP_SIZE = 100;

// ─── Procedurally generate a 100×100 map ──────────────────────────────────────
function generateMap(size) {
  const map = [];
  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      // Border = stone
      if (r === 0 || r === size - 1 || c === 0 || c === size - 1) {
        row.push('stone');
      // Cross paths at center
      } else if (r === Math.floor(size / 2) || c === Math.floor(size / 2)) {
        row.push('path');
      // Water ponds
      } else if (
        (r >= 10 && r <= 15 && c >= 10 && c <= 15) ||
        (r >= 30 && r <= 36 && c >= 60 && c <= 66) ||
        (r >= 65 && r <= 72 && c >= 20 && c <= 27) ||
        (r >= 70 && r <= 76 && c >= 70 && c <= 76)
      ) {
        row.push('water');
      // Sand patches
      } else if (
        (r >= 20 && r <= 25 && c >= 35 && c <= 45) ||
        (r >= 55 && r <= 60 && c >= 55 && c <= 65)
      ) {
        row.push('sand');
      } else {
        row.push('grass');
      }
    }
    map.push(row);
  }
  return map;
}

const DEMO_MAP = generateMap(MAP_SIZE);
const MAP_ROWS = MAP_SIZE;
const MAP_COLS = MAP_SIZE;

// ─── Tile palette ──────────────────────────────────────────────────────────────
const TILE_TYPES = {
  grass: { top: '#5a8a3c', left: '#3d6128', right: '#4a7230' },
  water: { top: '#3a7bd5', left: '#2558a8', right: '#2d67bf' },
  stone: { top: '#8a8a8a', left: '#5a5a5a', right: '#6e6e6e' },
  sand:  { top: '#c8b560', left: '#9e8e3a', right: '#b3a148' },
  path:  { top: '#b08050', left: '#7a5535', right: '#8e6640' },
};

// ─── Grid → screen (camera-space) ─────────────────────────────────────────────
// camX/camY are world-space pixel offsets. The canvas center is always the cam target.
function gridToScreen(col, row, camX, camY, canvasW, canvasH) {
  const worldX = (col - row) * (TILE_W / 2);
  const worldY = (col + row) * (TILE_H / 2);
  return {
    x: worldX - camX + canvasW / 2,
    y: worldY - camY + canvasH / 2,
  };
}

// ─── Grid → world (no canvas dependency) ──────────────────────────────────────
function gridToWorld(col, row) {
  return {
    wx: (col - row) * (TILE_W / 2),
    wy: (col + row) * (TILE_H / 2),
  };
}

// ─── Draw one isometric tile ──────────────────────────────────────────────────
function drawTile(ctx, sx, sy, fillTop, fillLeft, fillRight) {
  const hw = TILE_W / 2;
  const hh = TILE_H / 2;

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(sx + hw, sy + hh);
  ctx.lineTo(sx, sy + TILE_H);
  ctx.lineTo(sx - hw, sy + hh);
  ctx.closePath();
  ctx.fillStyle = fillTop;
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(sx - hw, sy + hh);
  ctx.lineTo(sx, sy + TILE_H);
  ctx.lineTo(sx, sy + TILE_H + TILE_DEPTH);
  ctx.lineTo(sx - hw, sy + hh + TILE_DEPTH);
  ctx.closePath();
  ctx.fillStyle = fillLeft;
  ctx.fill();
  ctx.stroke();

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

// ─── Draw sprite ──────────────────────────────────────────────────────────────
function drawSprite(ctx, col, row, camX, camY, canvasW, canvasH, color, label, isLocal) {
  const { x, y } = gridToScreen(col, row, camX, camY, canvasW, canvasH);
  const cx = x;
  const cy = y + TILE_H / 2;

  ctx.beginPath();
  ctx.ellipse(cx, cy + 2, 14, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy - 14, 14, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = isLocal ? '#ffffff' : 'rgba(255,255,255,0.5)';
  ctx.lineWidth = isLocal ? 2.5 : 1.5;
  ctx.stroke();

  const initials = (label || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${isLocal ? 11 : 9}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, cx, cy - 14);

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

  // Camera is stored as world-space coordinates (what world point is at canvas center)
  const stateRef = useRef({
    camX: 0,
    camY: 0,
    playerCol: Math.floor(MAP_SIZE / 2),
    playerRow: Math.floor(MAP_SIZE / 2),
    keys: {},
    lastTime: 0,
    moveAccum: 0,
    initialized: false,
  });
  const rafRef = useRef(null);

  // ── Render ────────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    const ctx = canvas.getContext('2d');
    const { camX, camY } = stateRef.current;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#1a2a3a';
    ctx.fillRect(0, 0, W, H);

    // Frustum cull — only draw tiles visible on screen (with padding)
    const pad = 4;
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const { x, y } = gridToScreen(col, row, camX, camY, W, H);
        if (x < -TILE_W * pad || x > W + TILE_W * pad) continue;
        if (y < -TILE_H * pad || y > H + TILE_H * pad) continue;
        const tile = TILE_TYPES[DEMO_MAP[row][col]] || TILE_TYPES.grass;
        drawTile(ctx, x, y, tile.top, tile.left, tile.right);
      }
    }

    const allSprites = [
      {
        col: stateRef.current.playerCol,
        row: stateRef.current.playerRow,
        color: '#6366f1',
        label: 'You',
        isLocal: true,
      },
      ...sprites.map((s, i) => ({
        col: Math.min(MAP_COLS - 2, Math.floor(MAP_SIZE / 2) + i + 1),
        row: Math.min(MAP_ROWS - 2, Math.floor(MAP_SIZE / 2) + i + 1),
        color: ['#ec4899', '#f59e0b', '#10b981', '#ef4444'][i % 4],
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
    const dt = Math.min(time - s.lastTime, 100); // cap to prevent spiral on tab blur
    s.lastTime = time;
    s.moveAccum += dt;

    const canvas = canvasRef.current;
    if (!canvas) { rafRef.current = requestAnimationFrame(loop); return; }

    // ── Snap camera on first valid frame (canvas has real dimensions) ──────
    if (!s.initialized && canvas.width > 0 && canvas.height > 0) {
      const { wx, wy } = gridToWorld(s.playerCol, s.playerRow);
      s.camX = wx;
      s.camY = wy;
      s.initialized = true;
    }

    // ── Movement ──────────────────────────────────────────────────────────
    const MOVE_INTERVAL = 180;
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

    // ── Camera lerp toward player's world position ─────────────────────────
    // Target = world-space position of the player tile center
    const { wx: targetX, wy: targetY } = gridToWorld(s.playerCol, s.playerRow);
    s.camX += (targetX - s.camX) * 0.08;
    s.camY += (targetY - s.camY) * 0.08;

    render();
    rafRef.current = requestAnimationFrame(loop);
  }, [render]);

  // ── Resize canvas ─────────────────────────────────────────────────────────
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

  // ── Keyboard ──────────────────────────────────────────────────────────────
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

  // ── RAF loop ──────────────────────────────────────────────────────────────
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

    // Inverse: screen → world → grid
    const worldX = mx - W / 2 + camX;
    const worldY = my - H / 2 + camY;
    const col = Math.round((worldX / (TILE_W / 2) + worldY / (TILE_H / 2)) / 2);
    const row = Math.round((worldY / (TILE_H / 2) - worldX / (TILE_W / 2)) / 2);

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