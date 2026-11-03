import { useState } from 'react';
import moment from 'moment';
import { CornerDownRight } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';

// One private conversation on a page: the note that opened it, then whatever was said
// back, oldest last, so the thread reads down the way a letter does.
function authorLabel(note, viewerEmail) {
  if (note.author_role === 'admin') return 'TOP 100 Masthead';
  if (note.author_email && note.author_email === viewerEmail) return 'You';
  return note.author_name || 'Reader';
}

function Note({ note, viewerEmail, reply = false }) {
  const platform = note.author_role === 'admin';
  return (
    <div className={reply ? 'mt-3' : ''}>
      <div className="mb-1 flex items-baseline gap-2">
        <span
          className="text-[9px] font-bold uppercase tracking-[0.2em]"
          style={{ color: platform ? P.copper : P.gold }}
        >
          {authorLabel(note, viewerEmail)}
        </span>
        <span className="text-[9px]" style={{ color: 'rgba(250,248,245,0.35)' }}>
          {note.created_date ? moment(note.created_date).format('D MMM') : ''}
        </span>
      </div>
      <p
        className="whitespace-pre-line text-[13px] leading-relaxed"
        style={{ color: platform ? P.sand : 'rgba(250,248,245,0.86)' }}
      >
        {note.body}
      </p>
    </div>
  );
}

export default function CommentThread({ root, replies = [], viewerEmail, sending, onReply }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');

  const send = async () => {
    const sent = await onReply(root, body);
    if (sent) {
      setBody('');
      setOpen(false);
    }
  };

  return (
    <article
      className="border-t pt-5"
      style={{ borderColor: 'rgba(201,168,124,0.22)' }}
    >
      <Note note={root} viewerEmail={viewerEmail} />

      {replies.length > 0 && (
        <div className="mt-3 border-l pl-3" style={{ borderColor: 'rgba(201,168,124,0.3)' }}>
          {replies.map((reply) => (
            <Note key={reply.id} note={reply} viewerEmail={viewerEmail} reply />
          ))}
        </div>
      )}

      {open ? (
        <div className="mt-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            autoFocus
            placeholder="Write back…"
            className="w-full resize-none rounded-sm px-3 py-2 text-[13px] leading-relaxed outline-none"
            style={{
              background: P.navyDeep,
              border: `1px solid rgba(201,168,124,0.35)`,
              color: P.cream,
            }}
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={send}
              disabled={sending || !body.trim()}
              className="flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-opacity disabled:opacity-40"
              style={{ background: P.copper, color: P.cream }}
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              Send reply
            </button>
            <button
              onClick={() => { setOpen(false); setBody(''); }}
              className="text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ color: 'rgba(250,248,245,0.5)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-2 flex h-7 items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
          style={{ color: P.gold }}
        >
          <CornerDownRight className="h-3.5 w-3.5" />
          Reply
        </button>
      )}
    </article>
  );
}