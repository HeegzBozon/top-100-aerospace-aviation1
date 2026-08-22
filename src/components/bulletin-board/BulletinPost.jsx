import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Renders a single bulletin card. Rich body (Quill HTML) for dispatch/field_note;
// plain body for notes. Owner sees edit/delete on hover.
export default function BulletinPost({ post, accent, isOwner, onEdit, onDelete, deleting }) {
  const date = post.published_date || post.created_date;
  const formatted = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <article className="group rounded-xl p-4" style={{ background: '#fff', border: `1px solid ${B.border}` }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
          {post.post_type === 'dispatch' ? 'Dispatch' : 'Note'}
          {post.status === 'draft' && <span className="ml-1.5 italic" style={{ color: B.muted }}>· draft</span>}
        </span>
        <div className="flex items-center gap-2">
          {formatted && <span className="text-[10px]" style={{ color: B.muted }}>{formatted}</span>}
          {isOwner && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit?.(post)} style={{ color: B.muted }}><Pencil className="w-3 h-3" /></button>
              <button onClick={() => onDelete?.(post.id)} disabled={deleting} style={{ color: B.muted }}>
                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {post.title && (
        <h3 className="text-base font-bold leading-snug mb-1.5" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
          {post.title}
        </h3>
      )}

      {post.rich_body ? (
        <div
          className="text-sm leading-relaxed prose-sm max-w-none"
          style={{ color: B.navy }}
          dangerouslySetInnerHTML={{ __html: post.rich_body }}
        />
      ) : post.body ? (
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: B.navy }}>{post.body}</p>
      ) : null}

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {post.tags.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${accent}14`, color: accent }}>
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}