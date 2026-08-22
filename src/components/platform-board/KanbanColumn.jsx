import WorkCard from './WorkCard';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// A single lifecycle column within a kanban lane.
export default function KanbanColumn({ column, items, user, accent, onUpvote, onOpenComments, emptyHint }) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: B.muted }}>{column.label}</span>
        <span className="text-[10px] font-semibold rounded-full px-1.5" style={{ background: B.cream, color: B.muted }}>{items.length}</span>
      </div>
      <div className="flex flex-col gap-2 min-h-[60px]">
        {items.length === 0 ? (
          <div className="rounded-lg p-3 text-center text-[11px] italic" style={{ border: `1px dashed ${B.border}`, color: B.muted }}>
            {emptyHint || 'Empty'}
          </div>
        ) : (
          items.map((it) => (
            <WorkCard
              key={it.id}
              item={it}
              user={user}
              accent={accent}
              onUpvote={() => onUpvote(it)}
              onOpenComments={() => onOpenComments(it)}
            />
          ))
        )}
      </div>
    </div>
  );
}