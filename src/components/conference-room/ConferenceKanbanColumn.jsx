import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

const LIMIT = 5;

// Mirrors the Backlog board's Kanban column treatment for the Conference Room.
// Caps visible cards at 5; a "Show N more" toggle reveals the rest.
export default function ConferenceKanbanColumn({ label, dot, count, emptyHint, children }) {
  const [expanded, setExpanded] = useState(false);
  const arr = React.Children.toArray(children);
  const visible = expanded ? arr : arr.slice(0, LIMIT);
  const hidden = arr.length - visible.length;

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>{label}</span>
        </div>
        <span className="text-[10px] font-semibold rounded-full px-1.5" style={{ background: B.cream, color: B.muted }}>{count}</span>
      </div>
      <div className="flex flex-col gap-2 min-h-[80px]">
        {arr.length === 0 ? (
          <div className="rounded-lg p-3 text-center text-[11px] italic" style={{ border: `1px dashed ${B.border}`, color: B.muted }}>
            {emptyHint}
          </div>
        ) : (
          <>
            {visible}
            {hidden > 0 && !expanded && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors"
                style={{ border: `1px solid ${B.border}`, color: B.navy, background: B.cream }}
              >
                Show {hidden} more
                <ChevronDown className="w-3 h-3" style={{ color: B.muted }} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}