import { useState } from 'react';
import { Eye, EyeOff, GripVertical, Settings2, Check, LayoutGrid } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Tile sizes snap to whole grid cells — 1x1, 1x2 (wide), 2x1 (tall), 2x2 (large).
// No fractional tiles; every tile fills at least one cell.
const SIZE_CLASS = {
  '1x1': '',
  '1x2': 'sm:col-span-2',
  '2x1': 'sm:row-span-2',
  '2x2': 'sm:col-span-2 sm:row-span-2',
};

// The customizable board grid. Every module is a tile, evenly distributed.
// Drag to reorder; toggle the eye to show or hide. Order + visibility persist.
export default function ModuleGrid({ tiles, order, hidden, accent, onSave }) {
  const [editing, setEditing] = useState(false);
  const [dragKey, setDragKey] = useState(null);
  const [overKey, setOverKey] = useState(null);

  const validKeys = tiles.map((t) => t.key);
  const baseOrder = order || [];
  const normOrder = [
    ...baseOrder.filter((k) => validKeys.includes(k)),
    ...validKeys.filter((k) => !baseOrder.includes(k)),
  ];
  const hiddenSet = new Set(hidden || []);
  const byKey = Object.fromEntries(tiles.map((t) => [t.key, t]));
  const visible = normOrder.filter((k) => !hiddenSet.has(k));
  const list = editing ? normOrder : visible;

  const handleDrop = (targetKey) => {
    if (!dragKey || dragKey === targetKey) { setDragKey(null); setOverKey(null); return; }
    const next = [...normOrder];
    const from = next.indexOf(dragKey);
    next.splice(from, 1);
    const to = next.indexOf(targetKey);
    next.splice(to, 0, dragKey);
    onSave(next, [...hiddenSet]);
    setDragKey(null);
    setOverKey(null);
  };

  const toggleHidden = (key) => {
    const next = hiddenSet.has(key) ? [...hiddenSet].filter((k) => k !== key) : [...hiddenSet, key];
    onSave(normOrder, next);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" style={{ color: accent }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: B.muted }}>Your board</span>
        </div>
        <button
          onClick={() => setEditing((e) => !e)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
          style={{ background: editing ? B.navy : '#fff', color: editing ? '#fff' : B.navy, border: `1px solid ${B.border}` }}
        >
          {editing ? <Check className="w-3.5 h-3.5" /> : <Settings2 className="w-3.5 h-3.5" style={{ color: accent }} />}
          {editing ? 'Done' : 'Customize'}
        </button>
      </div>

      {editing && (
        <p className="text-[11px] mb-3" style={{ color: B.muted }}>
          Drag a tile to reorder. Toggle the eye to show or hide.
        </p>
      )}

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 auto-rows-[minmax(160px,auto)] grid-flow-row-dense">
        {list.map((key) => {
          const tile = byKey[key];
          if (!tile) return null;
          const isHidden = hiddenSet.has(key);
          const framed = tile.frame !== false;
          const Icon = tile.icon;
          const dragHandlers = editing
            ? {
                draggable: true,
                onDragStart: () => setDragKey(key),
                onDragOver: (e) => { e.preventDefault(); setOverKey(key); },
                onDrop: () => handleDrop(key),
                onDragEnd: () => { setDragKey(null); setOverKey(null); },
              }
            : {};

          const controls = editing && (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => toggleHidden(key)} title={isHidden ? 'Show' : 'Hide'} style={{ color: isHidden ? B.muted : accent }}>
                {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <GripVertical className="w-3.5 h-3.5" style={{ color: B.muted }} />
            </div>
          );

          if (framed) {
            return (
              <div
                key={key}
                id={`tile-${key}`}
                {...dragHandlers}
                className={`rounded-2xl p-4 flex flex-col ${SIZE_CLASS[tile.size] || ''}`}
                style={{
                  background: '#fff',
                  border: overKey === key ? `2px dashed ${accent}` : `1px solid ${B.border}`,
                  opacity: isHidden ? 0.45 : 1,
                  cursor: editing ? (dragKey === key ? 'grabbing' : 'grab') : 'default',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] truncate" style={{ color: B.navy }}>
                      {tile.label}
                    </span>
                  </div>
                  {controls}
                </div>
                <div className="min-w-0 flex-1">{tile.node}</div>
              </div>
            );
          }

          // Unframed tiles render their own cards; grid just positions them.
          return (
            <div
              key={key}
              id={`tile-${key}`}
              {...dragHandlers}
              className={`flex flex-col ${SIZE_CLASS[tile.size] || ''}`}
              style={{
                opacity: isHidden ? 0.45 : 1,
                outline: overKey === key ? `2px dashed ${accent}` : 'none',
                outlineOffset: 4,
                borderRadius: 16,
                cursor: editing ? (dragKey === key ? 'grabbing' : 'grab') : 'default',
              }}
            >
              {editing && (
                <div className="flex justify-end mb-1">{controls}</div>
              )}
              {tile.node}
            </div>
          );
        })}
      </div>
    </div>
  );
}