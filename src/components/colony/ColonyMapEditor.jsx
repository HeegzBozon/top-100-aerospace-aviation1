import { useState } from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';

const COLS = 64, ROWS = 36;

// Admin map editor: the whole plate on a grid. Tap two corners to draw a barrier,
// tap a barrier to select it, then delete it. Save writes the room's layout.
export default function ColonyMapEditor({ mapUrl, label, walls: initial, custom, onSave, onReset, onClose }) {
  const [walls, setWalls] = useState(initial);
  const [anchor, setAnchor] = useState(null);
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);

  const cellOf = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { col: Math.floor(((e.clientX - r.left) / r.width) * COLS), row: Math.floor(((e.clientY - r.top) / r.height) * ROWS) };
  };
  const tap = (e) => {
    const c = cellOf(e);
    if (!anchor) {
      const hit = walls.findIndex(w => c.col >= w.col && c.col < w.col + w.w && c.row >= w.row && c.row < w.row + w.h);
      if (hit >= 0) { setSel(hit); return; }
      setSel(null); setAnchor(c); return;
    }
    const col = Math.min(anchor.col, c.col), row = Math.min(anchor.row, c.row);
    setWalls(ws => [...ws, { col, row, w: Math.abs(c.col - anchor.col) + 1, h: Math.abs(c.row - anchor.row) + 1 }]);
    setAnchor(null);
  };
  const run = async (fn) => { setBusy(true); await fn(); setBusy(false); onClose(); };
  const pct = (v, n) => `${(v / n) * 100}%`;

  return (
    <div className="absolute inset-0 z-50 flex flex-col overflow-y-auto bg-editorial-navy/95 p-3 text-editorial-cream">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-heading text-lg">Map editor · {label}</p>
        <button onClick={onClose} aria-label="Close"><X className="h-4 w-4" /></button>
      </div>
      <p className="mb-2 text-xs text-editorial-cream/70">
        {anchor ? 'Now tap the opposite corner.' : 'Tap a corner to start a barrier, or tap a barrier to select it.'}
      </p>
      <div onClick={tap} className="relative w-full cursor-crosshair select-none" style={{ aspectRatio: '16 / 9' }}>
        <img src={mapUrl} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:1.5625%_2.7778%]" />
        {walls.map((w, i) => (
          <div key={i} className={`absolute border ${sel === i ? 'border-editorial-gold bg-editorial-gold/45' : 'border-red-400 bg-red-500/35'}`}
            style={{ left: pct(w.col, COLS), top: pct(w.row, ROWS), width: pct(w.w, COLS), height: pct(w.h, ROWS) }} />
        ))}
        {anchor && <div className="absolute bg-editorial-copper" style={{ left: pct(anchor.col, COLS), top: pct(anchor.row, ROWS), width: pct(1, COLS), height: pct(1, ROWS) }} />}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={sel === null} onClick={() => { setWalls(ws => ws.filter((_, i) => i !== sel)); setSel(null); }}
          className="flex items-center gap-1 rounded border border-red-300 px-3 py-1.5 text-xs text-red-200 disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> Delete barrier</button>
        {anchor && <button onClick={() => setAnchor(null)} className="rounded border border-editorial-cream/30 px-3 py-1.5 text-xs">Cancel</button>}
        <span className="flex-1 self-center text-right text-xs text-editorial-cream/60">{walls.length} barriers</span>
      </div>
      <div className="mt-2 flex gap-2">
        <button disabled={busy || !custom} onClick={() => run(onReset)} className="flex-1 rounded border border-editorial-cream/30 py-2 text-xs disabled:opacity-40">Restore defaults</button>
        <button disabled={busy} onClick={() => run(() => onSave(walls))} className="flex flex-[2] items-center justify-center gap-2 rounded bg-editorial-copper py-2 text-sm font-semibold">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save layout
        </button>
      </div>
    </div>
  );
}