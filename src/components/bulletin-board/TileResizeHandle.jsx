import { useRef } from 'react';

const sizeToSpan = (s) => {
  const [c, r] = String(s || '1x1').split('x').map(Number);
  return { cols: c || 1, rows: r || 1 };
};
const spanToSize = (c, r) => `${c}x${r}`;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Drag the bottom-right corner to resize a board tile between 1x1, 1x2, 2x1, 2x2.
// Snaps to whole grid cells; updates live during drag, commits the final size on release.
export default function TileResizeHandle({ tileRef, size, accent, onChange, onCommit }) {
  const start = useRef(null);

  const onPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = tileRef?.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const { cols, rows } = sizeToSpan(size);
    start.current = {
      x: e.clientX,
      y: e.clientY,
      cols,
      rows,
      cellW: rect.width / cols,
      cellH: rect.height / rows,
    };
    try { e.target.setPointerCapture(e.pointerId); } catch {}
  };

  const onPointerMove = (e) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const cols = clamp(Math.round(start.current.cols + dx / start.current.cellW), 1, 2);
    const rows = clamp(Math.round(start.current.rows + dy / start.current.cellH), 1, 2);
    const next = spanToSize(cols, rows);
    if (next !== size) onChange(next);
  };

  const onPointerUp = (e) => {
    if (!start.current) return;
    try { e.target.releasePointerCapture?.(e.pointerId); } catch {}
    onCommit();
    start.current = null;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDragStart={(e) => e.preventDefault()}
      className="absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center cursor-nwse-resize touch-none z-10"
      style={{ color: accent }}
      title="Drag to resize"
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M11 4.5V11H4.5M11 11L4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}