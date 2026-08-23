import React from 'react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Mirrors the Backlog board's Kanban column treatment for the Conference Room.
export default function ConferenceKanbanColumn({ label, dot, count, emptyHint, children }) {
  const arr = React.Children.toArray(children);
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
        ) : arr}
      </div>
    </div>
  );
}