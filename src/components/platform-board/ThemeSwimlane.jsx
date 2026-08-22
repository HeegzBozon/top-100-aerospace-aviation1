import { B } from '@/components/fellow-home/fellowHomeConfig';
import { STATUS_COLUMNS } from './platformBoardConfig';
import OkrCard from './OkrCard';
import KanbanColumn from './KanbanColumn';

// A Strategic Theme swimlane: its OKRs, each with a kanban of linked epics.
export default function ThemeSwimlane({ theme, okrs, user, accent, onUpvote, onOpenComments }) {
  return (
    <section className="rounded-2xl p-4" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
        <h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: B.navy }}>{theme}</h2>
      </div>
      <div className="flex flex-col gap-5">
        {okrs.map(({ okr, epics }) => (
          <div key={okr.id} className="flex flex-col gap-3">
            <OkrCard okr={okr} accent={accent} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {STATUS_COLUMNS.map((col) => (
                <KanbanColumn
                  key={col.key}
                  column={col}
                  items={epics.filter((e) => (e.status || 'backlog') === col.key)}
                  user={user}
                  accent={accent}
                  onUpvote={onUpvote}
                  onOpenComments={onOpenComments}
                  emptyHint="No epics"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}