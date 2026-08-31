import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, X, ChevronUp, ChevronDown, Lock } from 'lucide-react';
import { brand } from '@/components/nominate/NominateConfig';
import ListEmptyState from '@/components/my-top100/ListEmptyState';

const RANK_COLORS = {
  1: { bg: '#FFD700', text: '#7a5200' },
  2: { bg: '#C0C0C0', text: '#444' },
  3: { bg: '#cd7f32', text: '#fff' },
};

export default function ListCanvas({
  rankings,
  onReorder,
  onRemove,
  onAddMore,
  onAdd,
  addedIds,
  onViewProfile,
  totalCount,
  readOnly = false,
}) {
  const [dragging, setDragging] = useState(null);
  const total = totalCount ?? rankings.length;

  if (rankings.length === 0) {
    if (readOnly) {
      return (
        <div className="px-4 py-10 text-center">
          <Lock className="w-5 h-5 mx-auto mb-2" style={{ color: `${brand.navy}40` }} />
          <p className="text-sm" style={{ color: `${brand.navy}50` }}>
            No nominees — voting has closed.
          </p>
        </div>
      );
    }
    return <ListEmptyState onAdd={onAdd} addedIds={addedIds} onBrowse={onAddMore} />;
  }

  return (
    <div className="px-4 py-4 min-w-0">
      <Reorder.Group
        axis="y"
        values={rankings}
        onReorder={readOnly ? () => {} : onReorder}
        className="space-y-2"
      >
        <AnimatePresence>
          {rankings.map((item, index) => {
            const rank = index + 1;
            const rankStyle = RANK_COLORS[rank];

            return (
              <Reorder.Item
                key={item.nominee_id}
                value={item}
                onDragStart={readOnly ? undefined : () => setDragging(item.nominee_id)}
                onDragEnd={readOnly ? undefined : () => setDragging(null)}
                drag={readOnly ? false : true}
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="flex items-center gap-3 p-3 rounded-2xl border"
                  style={{
                    background: dragging === item.nominee_id ? `${brand.navy}06` : 'white',
                    borderColor: dragging === item.nominee_id ? `${brand.gold}60` : `${brand.navy}08`,
                    boxShadow: dragging === item.nominee_id
                      ? '0 8px 24px rgba(10,18,30,0.12)'
                      : '0 1px 4px rgba(10,18,30,0.04)',
                    cursor: readOnly ? 'default' : 'grab',
                  }}
                >
                  {/* Rank number */}
                  <div
                    className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                    style={
                      rankStyle
                        ? { background: rankStyle.bg, color: rankStyle.text }
                        : { background: `${brand.navy}10`, color: `${brand.navy}80` }
                    }
                  >
                    {rank}
                  </div>

                  {/* Avatar + info (click to view profile) */}
                  <button
                    type="button"
                    onClick={() => onViewProfile?.(item)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div
                      className="h-9 w-9 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${brand.navy}, #0b2542)` }}
                    >
                      {item.nominee_avatar ? (
                        <img src={item.nominee_avatar} alt={item.nominee_name} className="w-full h-full object-cover" />
                      ) : (
                        item.nominee_name?.[0]?.toUpperCase()
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: brand.navy }}>
                        {item.nominee_name}
                      </p>
                      {item.nominee_title && (
                        <p className="text-[10px] truncate" style={{ color: `${brand.navy}55` }}>
                          {item.nominee_title}{item.nominee_company ? ` · ${item.nominee_company}` : ''}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Actions */}
                  {!readOnly && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Move up/down on mobile (alternative to drag for accessibility) */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => {
                            if (index > 0) {
                              const next = [...rankings];
                              [next[index - 1], next[index]] = [next[index], next[index - 1]];
                              onReorder(next);
                            }
                          }}
                          className="h-4 w-4 flex items-center justify-center rounded opacity-40 hover:opacity-100"
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-3 h-3" style={{ color: brand.navy }} />
                        </button>
                        <button
                          onClick={() => {
                            if (index < rankings.length - 1) {
                              const next = [...rankings];
                              [next[index + 1], next[index]] = [next[index], next[index + 1]];
                              onReorder(next);
                            }
                          }}
                          className="h-4 w-4 flex items-center justify-center rounded opacity-40 hover:opacity-100"
                          disabled={index === rankings.length - 1}
                        >
                          <ChevronDown className="w-3 h-3" style={{ color: brand.navy }} />
                        </button>
                      </div>

                      <GripVertical className="w-4 h-4 mx-1" style={{ color: `${brand.navy}30` }} />

                      <button
                        onClick={() => onRemove(item.nominee_id)}
                        className="h-7 w-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                        style={{ background: `${brand.navy}08` }}
                      >
                        <X className="w-3 h-3" style={{ color: `${brand.navy}60` }} />
                      </button>
                    </div>
                  )}

                  {readOnly && (
                    <Lock className="w-3.5 h-3.5 shrink-0" style={{ color: `${brand.navy}30` }} />
                  )}
                </motion.div>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>

      {/* Add more CTA at the bottom of list */}
      {!readOnly && total < 100 && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAddMore}
          className="mt-4 w-full py-3.5 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all"
          style={{ borderColor: `${brand.navy}20`, color: `${brand.navy}60` }}
        >
          + Add More ({100 - total} slots remaining)
        </motion.button>
      )}
    </div>
  );
}