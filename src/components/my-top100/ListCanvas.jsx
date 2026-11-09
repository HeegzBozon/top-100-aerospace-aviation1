import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, X, ChevronUp, ChevronDown, Lock, Plus } from 'lucide-react';
import ListEmptyState from '@/components/my-top100/ListEmptyState';
import { candidateName } from '@/lib/candidateName';
import { MANIFEST_TARGET, MANIFEST_CEILING } from '@/components/my-top100/manifestTargets';

// The Manifest, set as a roll.
//
// One record to a line, numbered down the margin, parted by hairlines rather than boxed
// in cards — the order is the thing being read, so the numbers carry the structure and the
// furniture stays out of the way. The order is the Fellow's own: the hand that moves a
// record is the only thing that reorders it.
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
  emptyTitle = 'Nothing listed',
  emptyNote = 'Analysis has closed for this cycle.',
}) {
  const [dragging, setDragging] = useState(null);
  const total = totalCount ?? rankings.length;

  if (rankings.length === 0) {
    if (readOnly) {
      return (
        <div className="border-t border-editorial-copper py-12 text-center">
          <Lock className="mx-auto mb-3 h-4 w-4 text-editorial-navy/35" aria-hidden="true" />
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-editorial-navy/55">
            {emptyTitle}
          </p>
          <p className="mt-2 font-body text-[12px] leading-relaxed text-editorial-navy/45">
            {emptyNote}
          </p>
        </div>
      );
    }
    return <ListEmptyState onAdd={onAdd} addedIds={addedIds} onBrowse={onAddMore} />;
  }

  return (
    <div className="min-w-0">
      {/* The way in stands at the head of the roll, where a reader begins: adding a record
          is the first act on the list, not a footnote under a hundred names. */}
      {!readOnly && total < MANIFEST_CEILING && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.995 }}
          onClick={onAddMore}
          className="mb-3 flex w-full items-center justify-between gap-3 border border-dashed border-editorial-copper/50 px-4 py-3.5 text-left transition-colors hover:bg-editorial-copper/5"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-3.5 w-3.5 text-editorial-copper" aria-hidden="true" />
            <span className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-editorial-navy">
              Nominate
            </span>
          </span>
          <span className="font-body text-[10px] uppercase tracking-[0.14em] text-editorial-navy/45 tabular-nums">
            {total < MANIFEST_TARGET
              ? `${MANIFEST_TARGET - total} places open`
              : `${MANIFEST_CEILING - total} beyond the hundred`}
          </span>
        </motion.button>
      )}

      <Reorder.Group
        axis="y"
        values={rankings}
        onReorder={readOnly ? () => {} : onReorder}
        className="border-t border-editorial-copper"
      >
        <AnimatePresence>
          {rankings.map((item, index) => {
            // A view keeps the place each record holds on the whole TOP 100.
            const place = item.list_place ?? index + 1;
            const leads = place <= 3;
            const isDragging = dragging === item.nominee_id;

            return (
              <Reorder.Item
                key={item.nominee_id}
                value={item}
                drag={readOnly ? false : true}
                onDragStart={readOnly ? undefined : () => setDragging(item.nominee_id)}
                onDragEnd={readOnly ? undefined : () => setDragging(null)}
              >
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-center gap-3 border-b border-editorial-navy/10 px-1 py-3 transition-colors sm:gap-4 ${
                    isDragging ? 'bg-editorial-sand' : 'hover:bg-editorial-sand/40'
                  } ${readOnly ? '' : 'cursor-grab'}`}
                >
                  <span
                    className={`w-7 shrink-0 text-right font-heading text-[19px] leading-none tabular-nums ${
                      leads ? 'text-editorial-copper' : 'text-editorial-navy/35'
                    }`}
                  >
                    {place}
                  </span>

                  <button
                    type="button"
                    onClick={() => onViewProfile?.(item)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-editorial-copper/35 bg-editorial-navy font-heading text-sm text-editorial-cream">
                      {item.nominee_avatar ? (
                        <img
                          src={item.nominee_avatar}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        candidateName(item)?.[0]?.toUpperCase()
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-heading text-[15px] leading-snug text-editorial-navy">
                        {candidateName(item)}
                      </span>
                      {item.nominee_title && (
                        <span className="mt-0.5 block truncate font-body text-[9.5px] uppercase tracking-[0.14em] text-editorial-navy/50">
                          {item.nominee_title}
                          {item.nominee_company ? ` · ${item.nominee_company}` : ''}
                        </span>
                      )}
                    </span>
                  </button>

                  {readOnly ? (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-editorial-navy/25" aria-hidden="true" />
                  ) : (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <div className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => {
                            if (index > 0) {
                              const next = [...rankings];
                              [next[index - 1], next[index]] = [next[index], next[index - 1]];
                              onReorder(next);
                            }
                          }}
                          disabled={index === 0}
                          aria-label={`Move ${candidateName(item)} up`}
                          className="flex h-4 w-4 items-center justify-center rounded text-editorial-navy/35 transition-colors hover:text-editorial-navy disabled:opacity-20"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (index < rankings.length - 1) {
                              const next = [...rankings];
                              [next[index + 1], next[index]] = [next[index], next[index + 1]];
                              onReorder(next);
                            }
                          }}
                          disabled={index === rankings.length - 1}
                          aria-label={`Move ${candidateName(item)} down`}
                          className="flex h-4 w-4 items-center justify-center rounded text-editorial-navy/35 transition-colors hover:text-editorial-navy disabled:opacity-20"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </div>

                      <GripVertical className="mx-0.5 h-4 w-4 text-editorial-navy/20" aria-hidden="true" />

                      <button
                        type="button"
                        onClick={() => onRemove(item.nominee_id)}
                        aria-label={`Remove ${candidateName(item)}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-editorial-navy/40 transition-colors hover:bg-editorial-copper/10 hover:text-editorial-copper"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              </Reorder.Item>
            );
          })}
        </AnimatePresence>
      </Reorder.Group>
    </div>
  );
}