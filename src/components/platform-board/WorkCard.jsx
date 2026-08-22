import { ArrowBigUp, MessageSquare, Calendar } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';
import { HORIZONS, ITEM_TYPES } from './platformBoardConfig';

// A single epic or side-quest card. Community upvotes and opens the discussion drawer.
export default function WorkCard({ item, user, accent, onUpvote, onOpenComments }) {
  const upvoted = (item.upvoted_by || []).includes(user?.email);
  const horizon = item.horizon ? HORIZONS[item.horizon] : null;
  const typeLabel = ITEM_TYPES[item.type] || item.type;

  return (
    <div className="rounded-xl p-3 transition-shadow hover:shadow-sm" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        {horizon && (
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded-full" style={{ background: `${horizon.color}1a`, color: horizon.color }}>
            {horizon.label}
          </span>
        )}
        {typeLabel && <span className="text-[9px] font-semibold uppercase tracking-[0.12em]" style={{ color: B.muted }}>{typeLabel}</span>}
      </div>

      <p className="text-sm font-semibold leading-snug mb-1" style={{ color: B.navy }}>{item.title}</p>
      {item.description && (
        <p className="text-xs leading-snug mb-2 line-clamp-3" style={{ color: B.muted }}>{item.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <button onClick={onUpvote} className="inline-flex items-center gap-1 text-xs font-semibold disabled:opacity-50" style={{ color: upvoted ? accent : B.muted }}>
            <ArrowBigUp className="w-3.5 h-3.5" style={{ color: upvoted ? accent : B.muted }} /> {item.upvotes || 0}
          </button>
          <button onClick={onOpenComments} className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: B.muted }}>
            <MessageSquare className="w-3.5 h-3.5" /> {item.comments_count || 0}
          </button>
        </div>
        {item.target_date && (
          <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: B.muted }}>
            <Calendar className="w-3 h-3" />
            {new Date(item.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}